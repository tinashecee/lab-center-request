# Notification Backend Server

This is a local Node.js backend server for sending Firebase Cloud Messaging (FCM) notifications during development.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Rename it to `firebase-service-account-key.json`
7. Place it in the `backend` folder

**Important:** Never commit this file to git! It's already in `.gitignore`.

### 3. Run the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will run on `http://localhost:3004` by default.

### 4. Test the Server

Visit `http://localhost:3004/health` in your browser to verify it's running.

## Troubleshooting

### "Invalid JWT Signature" Error

If you see this error, try these solutions:

1. **Generate a NEW service account key:**
   - Go to [Firebase Console Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk)
   - Delete the old key if it exists
   - Click **Generate New Private Key**
   - Download and replace `firebase-service-account-key.json`
   - Restart the server

2. **Check system time:**
   - Make sure your computer's clock is synchronized
   - On Windows: Settings → Time & Language → Sync now
   - On Mac/Linux: `sudo ntpdate -s time.nist.gov`

3. **Verify key file format:**
   - The JSON file should have these fields: `project_id`, `private_key`, `client_email`
   - Make sure the file is valid JSON (no extra commas, proper quotes)

4. **Check if key was revoked:**
   - Go to [Firebase IAM](https://console.firebase.google.com/iam-admin/serviceaccounts/project)
   - Verify the key ID matches your downloaded key

## Endpoints

- `GET /health` - Health check endpoint
- `POST /send-notification` - Send FCM notification
  - Body: `{ token: string, message: object }`

## Environment Variables

You can set the port using:
```bash
PORT=3004 npm start
```
