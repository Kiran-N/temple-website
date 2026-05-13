# Quick Start Guide

Follow these steps in order to get your temple website live!

## ✅ Pre-Deployment Checklist

- [ ] Buy domain: lakshmichennakeshavaswamy.com
- [ ] Create Google account (if you don't have one)
- [ ] Have phone ready for photos

---

## 🚀 5-Step Deployment (30 minutes total)

### Step 1: Firebase Setup (10 min)

1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Name: `temple-tracker`
4. Disable Google Analytics
5. Click "Firestore Database" → "Create Database"
6. Select "Production mode" → Location: "asia-south1"
7. Go to "Authentication" → "Email/Password" → Enable
8. Add users:
   - kiran@temple.com / kiran123
   - nageswara@temple.com / reddy123
9. Go to Project Settings ⚙️ → Copy Firebase config

### Step 2: Cloudinary Setup (5 min)

1. Go to https://cloudinary.com/users/register/free
2. Sign up
3. Copy Cloud Name from dashboard
4. Settings → Upload → Add preset: `temple_photos` (Unsigned)

### Step 3: Configure Website (5 min)

1. Copy `.env.example` to `.env.local`
2. Fill in Firebase config from Step 1
3. Fill in Cloudinary cloud name from Step 2

### Step 4: Deploy to Vercel (5 min)

**Easy Way (No coding required):**

1. Create free GitHub account if needed
2. Upload project folder to GitHub
3. Go to https://vercel.com
4. Sign in with GitHub
5. Click "Import Project"
6. Select your repository
7. Add environment variables from `.env.local`
8. Click "Deploy"

**Command Line Way:**

```bash
npm install -g vercel
cd temple-website
vercel
```

### Step 5: Connect Domain (5 min)

1. In Vercel dashboard → Settings → Domains
2. Add: lakshmichennakeshavaswamy.com
3. Update DNS at your domain registrar:
   - Add A record pointing to Vercel's IP
   - Or add CNAME pointing to your-project.vercel.app
4. Wait 24 hours for DNS propagation

---

## ✅ Post-Deployment Setup

### Initial Login

1. Visit: https://lakshmichennakeshavaswamy.com/admin/login
2. Login with: kiran / kiran123
3. **Change password immediately!**
4. Add other admins if needed

### Test Everything

- [ ] Record a test donation
- [ ] Check receipt generates
- [ ] Record a test expense
- [ ] Verify public site shows stats
- [ ] Test from phone (important!)

---

## 📱 Mobile Access

**To make it work like an app on phone:**

1. Open website in Chrome
2. Menu (3 dots) → "Add to Home Screen"
3. Now it works like a real app!

---

## 🆘 Need Help?

**Common Issues:**

1. **"Permission denied"**
   - Check Firebase rules are published
   - Verify admin exists in Authentication

2. **"Can't upload photo"**
   - Check Cloudinary preset is "Unsigned"
   - Verify cloud name is correct

3. **"Website not updating"**
   - Hard refresh: Ctrl+F5 or Cmd+Shift+R
   - Wait 5 minutes for deployment

**Still stuck?**
- Contact Kiran
- Check detailed README.md for full instructions

---

## 🎉 You're Done!

Your temple website is now live with:

✅ Public donation tracking  
✅ Admin panel  
✅ Automatic receipts  
✅ Photo gallery  
✅ Full transparency  

**Total cost: ₹0/month** (just domain ₹700/year)

---

**Next Steps:**

1. Share public URL with community
2. Start recording real donations
3. Upload construction progress photos
4. Download this as backup

**May Lord Chennakeshava bless this project! 🙏**
