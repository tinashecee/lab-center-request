import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

export const authService = {
  async login(email, password) {
    try {
      // Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Require verified email
      if (!userCredential.user.emailVerified) {
        try {
          console.log('[authService] User unverified, attempting to send verification email to', userCredential.user.email)
          await sendEmailVerification(userCredential.user)
          console.log('[authService] Verification email sent on unverified login')
        } catch (e) {
          console.warn('Failed to auto-send verification email on unverified login:', e)
        }
        await firebaseSignOut(auth)
        throw new Error('Please verify your email address before logging in. We just sent a verification email.')
      }
      
      // Check center_users collection for approval status
      const centerUsersRef = collection(db, 'center_users')
      const centerUserQuery = query(centerUsersRef, where('email', '==', email))
      const centerUserSnapshot = await getDocs(centerUserQuery)
      
      if (centerUserSnapshot.empty) {
        await firebaseSignOut(auth)
        throw new Error('Your account is not registered as a center user.')
      }

      const centerDoc = centerUserSnapshot.docs[0]
      const centerUserData = centerDoc.data()

      // Check approval status
      if (centerUserData.status === 'pending') {
        await firebaseSignOut(auth)
        throw new Error('Your account is pending approval. Please wait for administrator approval.')
      }
      
      if (centerUserData.status === 'rejected') {
        await firebaseSignOut(auth)
        throw new Error('Your account has been rejected. Please contact an administrator.')
      }

      if (centerUserData.status !== 'approved') {
        await firebaseSignOut(auth)
        throw new Error('Your account is not approved yet.')
      }

      // Optionally mirror email verification status into Firestore field
      if (!centerUserData.email_verified && userCredential.user.emailVerified) {
        try {
          await updateDoc(doc(db, 'center_users', centerDoc.id), { email_verified: true })
        } catch (mirrorErr) {
          console.warn('Could not mirror email_verified to Firestore:', mirrorErr)
        }
      }

      // User is approved and verified
      return {
        authUser: userCredential.user,
        userData: {
          id: centerDoc.id,
          name: centerUserData.name,
          email: centerUserData.email,
          phoneNumber: centerUserData.phoneNumber,
          center: centerUserData.centerName,
          centerId: centerUserData.centerId,
          role: 'Center User',
          department: 'Sample Collection',
          status: 'Active'
        }
      }
      
    } catch (error) {
      console.error('Login error:', error)
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password')
      }
      
      if (error.message) {
        throw error
      }
      
      throw new Error('Login failed. Please try again.')
    }
  },
  
  async register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Immediately send verification; caller may also send explicitly
      try {
        console.log('[authService] Sending verification email on register to', userCredential.user.email)
        await sendEmailVerification(userCredential.user)
      } catch (verifyErr) {
        console.warn('[authService] Failed to send verification email on register:', verifyErr)
      }
      return userCredential.user
    } catch (error) {
      console.error('Registration error:', error)
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Email is already registered')
      }
      
      if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters')
      }
      
      throw error
    }
  },
  
  async logout() {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },
  
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback)
  },
  
  getCurrentUser() {
    return auth.currentUser
  },

  async sendVerificationEmail(user = auth.currentUser) {
    if (!user) {
      console.warn('[authService] sendVerificationEmail: no current user')
      throw new Error('No authenticated user to verify')
    }
    try {
      console.log('[authService] Sending verification email to', user.email)
      await sendEmailVerification(user)
      console.log('[authService] Verification email sent')
    } catch (err) {
      console.error('[authService] Failed to send verification email:', err)
      throw err
    }
  },

  async resendVerificationWithLogin(email, password) {
    // Sign in temporarily to send verification, then sign out
    const credential = await signInWithEmailAndPassword(auth, email, password)
    try {
      console.log('[authService] Resend verification (with login) to', credential.user.email)
      await sendEmailVerification(credential.user)
      console.log('[authService] Resent verification email')
    } finally {
      await firebaseSignOut(auth)
    }
  },

  async sendPasswordReset(email) {
    await sendPasswordResetEmail(auth, email)
  }
}

