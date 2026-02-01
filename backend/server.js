import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3004;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
let firebaseInitialized = false;
try {
  // Path to your Firebase service account key JSON file
  // Place your firebase-service-account-key.json in the backend folder
  const serviceAccountPath = join(__dirname, 'firebase-service-account-key.json');
  
  // Check if file exists
  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    
    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Service account key is missing required fields (project_id, private_key, or client_email)');
    }

    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`📋 Project ID: ${serviceAccount.project_id}`);
  } catch (fileError) {
    if (fileError.code === 'ENOENT') {
      console.error('❌ Firebase service account key file not found!');
      console.error(`   Expected location: ${serviceAccountPath}`);
      console.error('   Please download the key from Firebase Console and place it in the backend folder.');
    } else if (fileError.message.includes('required fields')) {
      console.error('❌ Invalid service account key file:', fileError.message);
      console.error('   Please download a new key from Firebase Console.');
    } else {
      console.error('❌ Error reading service account key:', fileError.message);
    }
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  if (error.message.includes('Invalid JWT Signature')) {
    console.error('');
    console.error('🔧 Possible solutions:');
    console.error('   1. Generate a NEW service account key from Firebase Console');
    console.error('   2. Make sure your system time is synchronized');
    console.error('   3. Check if the key was revoked in Firebase Console');
    console.error('   Go to: https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk');
  }
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Notification server is running' });
});

// Send notification endpoint
app.post('/send-notification', async (req, res) => {
  // Check if Firebase is initialized
  if (!firebaseInitialized) {
    return res.status(500).json({ 
      success: false, 
      error: 'Firebase Admin SDK is not initialized. Check server logs.' 
    });
  }

  const { token, message, driverId, driverName } = req.body;

  // Validate request body
  if (!token) {
    return res.status(400).json({ 
      success: false, 
      error: 'Token is required' 
    });
  }

  if (!message) {
    return res.status(400).json({ 
      success: false, 
      error: 'Message is required' 
    });
  }

  // Extract user/driver identifier
  const userIdentifier = driverName || driverId || token.substring(0, 20) + '...';
  const timestamp = new Date().toISOString();

  console.log(`\n📤 [${timestamp}] Sending notification to user: ${userIdentifier}`);
  console.log(`   Driver ID: ${driverId || 'N/A'}`);
  console.log(`   Title: ${message.title || 'N/A'}`);
  console.log(`   Body: ${message.body || 'N/A'}`);
  console.log(`   Sample ID: ${message.sample_id || 'N/A'}`);

  const payload = {
    notification: {
      title: message.title || 'Notification',
      body: message.body || '',
    },
    data: {
      sample_id: String(message.sample_id || ''),
      requested_at: String(message.requestedAt || ''),
      caller_name: String(message.caller_name || ''),
      caller_number: String(message.caller_number || ''),
      lat: String(message.lat || ''),
      lng: String(message.lng || ''),
      message: String(message.message || ''),
      notification_type: String(message.notification_type || ''),
    },
    token: token,
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log(`✅ [${timestamp}] Notification sent successfully to user: ${userIdentifier}`);
    console.log(`   Driver ID: ${driverId || 'N/A'}`);
    console.log(`   Message ID: ${response}`);
    console.log(`   Status: Success\n`);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error(`❌ [${timestamp}] Error sending notification to user: ${userIdentifier}`);
    console.error(`   Driver ID: ${driverId || 'N/A'}`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}\n`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT,'0.0.0.0', () => {
  console.log(`🚀 Notification server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📨 Send notification: POST http://localhost:${PORT}/send-notification`);
});
