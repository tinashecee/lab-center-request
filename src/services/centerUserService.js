import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

const centerUsersRef = collection(db, 'center_users')

export const centerUserService = {
  async registerCenterUser(userData) {
    try {
      // Check if email already exists
      const emailQuery = query(centerUsersRef, where('email', '==', userData.email))
      const emailSnapshot = await getDocs(emailQuery)
      
      if (!emailSnapshot.empty) {
        throw new Error('Email is already registered')
      }
      
      const centerUserData = {
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        centerId: userData.centerId,
        centerName: userData.centerName,
        status: 'pending',
        email_verified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(centerUsersRef, centerUserData)
      return docRef.id
    } catch (error) {
      console.error('Error registering center user:', error)
      throw error
    }
  },
  
  async getCenterUserByEmail(email) {
    try {
      const q = query(centerUsersRef, where('email', '==', email))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }
      
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      }
    } catch (error) {
      console.error('Error fetching center user:', error)
      throw error
    }
  },
  
  async getCenterUsers() {
    try {
      const snapshot = await getDocs(centerUsersRef)
      return snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }))
    } catch (error) {
      console.error('Error fetching center users:', error)
      throw error
    }
  },
  
  async approveCenterUser(userId, approvedBy) {
    try {
      const userDoc = doc(db, 'center_users', userId)
      await updateDoc(userDoc, {
        status: 'approved',
        approvedBy: approvedBy,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Error approving center user:', error)
      throw error
    }
  },
  
  async rejectCenterUser(userId, rejectedBy) {
    try {
      const userDoc = doc(db, 'center_users', userId)
      await updateDoc(userDoc, {
        status: 'rejected',
        rejectedBy: rejectedBy,
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return true
    } catch (error) {
      console.error('Error rejecting center user:', error)
      throw error
    }
  }
}

