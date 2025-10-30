# Firebase Setup Guide for AeroVelocity

## 📋 Overview

This project uses **Firebase as a backend service**, not a separate server. The architecture is:

```
Frontend (React App)
    ↓ (makes SDK calls)
Firebase Services (Hosted by Google)
├── Authentication (Google Sign-In)
├── Firestore (Database for metadata)
└── Storage (File uploads)
```

**No separate backend server needed!** Everything is handled by Firebase.

## 🚀 Quick Start

### Option 1: Development Without Firebase (Mock Mode)

The app works immediately without Firebase configuration. It will show:
- ⚠️ "Firebase not configured" warnings
- Mock sign-in (simulates Google sign-in)
- Mock file uploads (simulated progress)
- All features work but don't persist

### Option 2: Full Firebase Integration

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: "AeroVelocity" (or any name)
4. Follow the setup wizard

#### Step 2: Enable Services

**Enable Authentication:**
1. In Firebase Console, go to "Build" → "Authentication"
2. Click "Get Started"
3. Enable "Google" sign-in provider
4. Add your domain to authorized domains

**Enable Firestore:**
1. Go to "Build" → "Firestore Database"
2. Click "Create Database"
3. Start in "Test mode" (for development)
4. Choose a location

**Enable Storage:**
1. Go to "Build" → "Storage"
2. Click "Get Started"
3. Start in test mode
4. Choose same location as Firestore

#### Step 3: Get Credentials

1. In Firebase Console, click the gear icon ⚙️ → "Project Settings"
2. Scroll to "Your apps" section
3. Click "Web" icon `</>`
4. Register app with nickname (e.g., "AeroVelocity Web")
5. Copy the config object

#### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:...
```

#### Step 5: Set Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own documents
    match /datasets/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /predictions/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

#### Step 6: Set Storage Security Rules

In Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /datasets/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

#### Step 7: Restart Development Server

```bash
npm run dev
```

## 📦 File Structure

```
Aero Velocity/
├── .env                    # Your Firebase credentials (NOT in git)
├── .env.example            # Template (safe for git)
├── src/
│   ├── config/
│   │   └── firebase.js     # Firebase initialization
│   ├── services/
│   │   ├── authService.js  # Authentication logic
│   │   ├── storageService.js # File upload logic
│   │   └── databaseService.js # Firestore operations
│   ├── context/
│   │   └── AuthContext.jsx # Auth state management
│   ├── components/
│   │   ├── AuthButton.jsx  # Sign-in button
│   │   └── FileUpload.jsx  # File upload component
│   └── pages/
│       └── Predict.jsx     # Uses FileUpload
```

## 🧪 Testing the Integration

### Test Mock Mode (No Firebase)

1. Start dev server: `npm run dev`
2. You'll see warning: "Firebase not configured"
3. Click "Sign in with Google" → works with mock data
4. Upload files → works with mock progress
5. Everything works but doesn't save

### Test with Real Firebase

1. Complete setup above
2. Add your `.env` credentials
3. Restart dev server
4. Sign in with Google → real authentication
5. Upload files → real Firebase Storage upload

## 🔒 Security Notes

**Important for Production:**
- Update Firestore security rules
- Update Storage security rules
- Add your production domain to authorized domains
- Never commit `.env` file to git (already in `.gitignore`)

## 📊 How It Works

### Authentication Flow:
```
User clicks "Sign in" → Firebase Auth → Google popup → User signed in
```

### File Upload Flow:
```
User uploads file → Firebase Storage → Upload progress → Save metadata to Firestore
```

### Data Structure:

**Firestore Collections:**
- `datasets/{id}` - Uploaded dataset metadata
- `predictions/{id}` - Prediction results

**Storage Structure:**
```
datasets/
  {userId}/
    {timestamp}_{filename}
```

## 🐛 Troubleshooting

**"Firebase not configured" warning:**
- Check `.env` file exists and has correct credentials
- Restart dev server after adding `.env`

**Sign-in doesn't work:**
- Check Google sign-in is enabled in Firebase Console
- Check your domain is in authorized domains

**File upload fails:**
- Check Storage is enabled
- Check Storage security rules allow uploads

**Firestore permission errors:**
- Check Firestore security rules
- Check you're authenticated

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | `my-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | `my-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | App ID | `1:123:web:abc` |

## ✅ Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Google)
- [ ] Firestore enabled
- [ ] Storage enabled
- [ ] `.env` file configured
- [ ] Security rules updated
- [ ] Development server restarted
- [ ] Sign-in tested
- [ ] File upload tested

---

**Need help?** Check the main README.md or contact the team.

