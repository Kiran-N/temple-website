# Lakshmi Chennakeshava Swami Temple Website

A transparent temple construction fund tracker with public website and admin panel.

## Features

### Public Website
- ✅ Live donation and expense statistics
- ✅ Transparent expense breakdown (excluding sensitive items)
- ✅ Construction progress photo gallery
- ✅ Donation information and contact details

### Admin Panel
- ✅ Secure login system with role-based access
- ✅ Record donations with automatic receipt generation
- ✅ Track expenses with photo upload capability
- ✅ Upload construction progress photos
- ✅ View all transactions
- ✅ Manage admin users (super admin only)
- ✅ Password-protected sensitive expense categories

## Default Admin Accounts

**Super Admin:**
- Username: `kiran`
- Password: `kiran123`

**Admin:**
- Username: `nageswara`
- Password: `reddy123`

⚠️ **IMPORTANT:** Change these passwords immediately after first login!

## Setup Instructions

### Prerequisites
- Google account (for Firebase)
- Cloudinary account (for image hosting) - Free tier
- Domain name: lakshmichennakeshavaswamy.com
- Vercel account (free)

---

## Step 1: Firebase Setup (5 minutes)

Firebase will store all your transaction data securely.

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `temple-construction-tracker`
4. Disable Google Analytics (not needed)
5. Click "Create Project"

### 1.2 Enable Firestore Database

1. In Firebase console, click "Firestore Database" in left menu
2. Click "Create Database"
3. Select "Start in production mode"
4. Choose location: `asia-south1` (Mumbai - closest to India)
5. Click "Enable"

### 1.3 Set Up Security Rules

1. Click "Rules" tab in Firestore
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public can read donations and expenses (except facilitation payments)
    match /donations/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /expenses/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Only authenticated admins can access facilitation payments
    match /facilitation_payments/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Only authenticated admins can manage photos
    match /progress_photos/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Only admins can manage admin accounts
    match /admins/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

### 1.4 Enable Authentication

1. Click "Authentication" in left menu
2. Click "Get Started"
3. Click "Email/Password"
4. Enable "Email/Password" toggle
5. Click "Save"

### 1.5 Add Admin Users

1. In Authentication tab, click "Users"
2. Click "Add User"
3. Add first admin:
   - Email: `kiran@temple.com`
   - Password: `kiran123`
4. Click "Add User" again for second admin:
   - Email: `nageswara@temple.com`
   - Password: `reddy123`

### 1.6 Get Firebase Configuration

1. Click gear icon ⚙️ next to "Project Overview"
2. Click "Project Settings"
3. Scroll down to "Your apps"
4. Click web icon `</>`
5. App nickname: `Temple Website`
6. Click "Register App"
7. Copy the configuration object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "temple-....firebaseapp.com",
  projectId: "temple-...",
  storageBucket: "temple-....appspot.com",
  messagingSenderId: "...",
  appId: "1:..."
};
```

8. Save this for later!

---

## Step 2: Cloudinary Setup (3 minutes)

Cloudinary will host all your construction progress photos.

### 2.1 Create Account

1. Go to [Cloudinary.com](https://cloudinary.com/users/register/free)
2. Sign up for free account
3. Verify your email

### 2.2 Get API Credentials

1. Login to Cloudinary dashboard
2. You'll see your credentials at top:
   - **Cloud Name**: (e.g., `dxyz123`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (click "Show" to reveal)

3. Save these for later!

### 2.3 Create Upload Preset

1. Click gear icon ⚙️ (Settings)
2. Click "Upload" tab
3. Scroll down to "Upload presets"
4. Click "Add upload preset"
5. Settings:
   - **Preset name**: `temple_photos`
   - **Signing Mode**: Unsigned
   - **Folder**: `temple-construction`
6. Click "Save"

---

## Step 3: Configure the Website

### 3.1 Create Environment File

In the project root, create a file called `.env.local`:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=temple_photos
```

Replace all the `your_..._here` values with your actual credentials from Step 1 and Step 2.

---

## Step 4: Deploy to Vercel (5 minutes)

### 4.1 Prepare for Deployment

1. Make sure all files are ready
2. Create a GitHub repository (optional but recommended)

### 4.2 Deploy to Vercel

**Option A: Deploy from GitHub (Recommended)**

1. Push your code to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Sign up/login with GitHub
4. Click "Add New Project"
5. Import your repository
6. Add environment variables:
   - Copy all variables from `.env.local`
   - Add each one in Vercel's environment variables section
7. Click "Deploy"

**Option B: Deploy from Local Files**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Run deployment:
   ```bash
   cd temple-website
   vercel
   ```

3. Follow prompts:
   - Link to existing project? No
   - Project name: `temple-website`
   - Directory: `./`
   - Build settings: (use defaults)

4. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   ```
   (Repeat for each variable)

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### 4.3 Connect Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add domain: `lakshmichennakeshavaswamy.com`
4. Follow DNS configuration instructions:
   - Add A record or CNAME as shown
   - Update your domain registrar's DNS settings
5. Wait 24-48 hours for DNS propagation

---

## Step 5: Initial Data Setup

### 5.1 Create Default Admins in Firestore

1. Go to Firebase Console → Firestore
2. Click "Start Collection"
3. Collection ID: `admins`
4. Add first document:
   - Document ID: `kiran`
   - Fields:
     ```
     name: "Kiran" (string)
     role: "super_admin" (string)
     email: "kiran@temple.com" (string)
     created: (timestamp - auto)
     ```

5. Add second document:
   - Document ID: `nageswara`
   - Fields:
     ```
     name: "Nageswara Reddy" (string)
     role: "admin" (string)
     email: "nageswara@temple.com" (string)
     created: (timestamp - auto)
     ```

---

## How to Use

### For Admins

1. **Login**
   - Go to: `https://lakshmichennakeshavaswamy.com/admin/login`
   - Use your credentials
   - Change password on first login

2. **Record Donation**
   - Click "Add Donation"
   - Fill form
   - Receipt generates automatically
   - Print or save as PDF

3. **Record Expense**
   - Click "Add Expense"
   - Select category
   - Upload receipt photo
   - For "Facilitation Payments", password is: `temple123`

4. **Upload Progress Photos**
   - Click "Progress Photos"
   - Upload from phone/computer
   - Add description
   - Photos appear on public site immediately

5. **Add More Admins** (Super Admin only)
   - Click "Manage Admins"
   - Add username, password, name
   - Choose role: Admin or Super Admin

### For Public Visitors

- Just visit: `https://lakshmichennakeshavaswamy.com`
- See live stats
- View expense breakdown
- See construction progress
- No login required

---

## Security Features

✅ Passwords stored securely in Firebase Auth  
✅ Sensitive expenses (facilitation payments) password-protected  
✅ Sensitive expenses NOT shown on public site  
✅ Admin-only routes protected  
✅ Receipt photos stored securely in Cloudinary  
✅ SSL/HTTPS automatic with Vercel  

---

## Data Backup

### Automatic Backups (Firebase)
- Firebase automatically backs up your data
- You can export anytime

### Manual Export

1. Go to Firebase Console → Firestore
2. Click three dots menu
3. "Export data"
4. Save to Google Cloud Storage

Or download as Excel from Admin Dashboard (coming soon).

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| Firebase | 1GB storage, 50K reads/day | FREE |
| Cloudinary | 25GB, 25K images | FREE |
| Vercel | 100GB bandwidth | FREE |
| **Domain** | N/A | **₹500-800/year** |

**Total Monthly Cost: ₹0** (just domain annually)

---

## Troubleshooting

### Issue: "Permission denied" in Firebase
**Solution:** Check Firestore security rules are published correctly

### Issue: Images not uploading
**Solution:** Verify Cloudinary upload preset is set to "Unsigned"

### Issue: Can't login
**Solution:** 
1. Check Firebase Authentication is enabled
2. Verify admin user exists in Firebase Auth
3. Clear browser cache

### Issue: Website not updating
**Solution:** 
1. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check Vercel deployment succeeded

---

## Support Contacts

**Technical Issues:**
- Kiran (Super Admin)

**For Donors:**
- Nageswara Reddy (Temple Coordinator)

---

## Future Enhancements (Phase 2)

- [ ] Online UPI donation integration
- [ ] SMS/Email receipts to donors
- [ ] WhatsApp notifications for admins
- [ ] Mobile app (Android/iOS)
- [ ] Automatic bank statement reconciliation
- [ ] Multi-language support (Telugu)
- [ ] Advanced analytics dashboard
- [ ] Export reports to Excel/PDF

---

## Version

**Current Version:** 1.0.0  
**Last Updated:** May 2026  
**Built with:** Next.js, Firebase, Cloudinary, Vercel

---

## License

This project is built for Lakshmi Chennakeshava Swami Temple, Yaramalapalli.

---

**Made with devotion 🙏 for transparency and accountability**
