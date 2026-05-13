# Vercel Deployment Guide

Complete step-by-step guide to deploy your temple website to Vercel.

---

## Why Vercel?

✅ **Free forever** for this use case  
✅ **Automatic HTTPS** (secure connection)  
✅ **Global CDN** (fast loading in India)  
✅ **Easy updates** (just push code changes)  
✅ **Zero configuration** needed  

---

## Method 1: Deploy from GitHub (Recommended)

This is the easiest way and allows automatic updates.

### Step 1: Create GitHub Account

1. Go to https://github.com
2. Click "Sign up"
3. Choose free plan
4. Verify email

### Step 2: Upload Code to GitHub

**Option A: Using GitHub Website (No software needed)**

1. Go to https://github.com/new
2. Repository name: `temple-website`
3. Select "Public" or "Private" (your choice)
4. Click "Create repository"
5. Click "uploading an existing file"
6. Drag and drop ALL files from `temple-website` folder
7. Click "Commit changes"

**Option B: Using Git (If you know command line)**

```bash
cd temple-website
git init
git add .
git commit -m "Initial temple website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/temple-website.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel to access GitHub
4. Click "Import Project"
5. Find `temple-website` repository
6. Click "Import"

### Step 4: Configure Environment Variables

Before deploying, you MUST add environment variables:

1. On import screen, expand "Environment Variables"
2. Add each variable from your `.env.local` file:

```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: (paste your actual Firebase API key)

Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: (paste your actual auth domain)

Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: (paste your actual project ID)

(... continue for all variables)
```

**Complete list of variables to add:**
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- NEXT_PUBLIC_CLOUDINARY_API_KEY
- NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

3. Click "Deploy"

### Step 5: Wait for Deployment

- Takes 2-3 minutes
- You'll see build logs
- When done, you'll see "🎉 Congratulations!"
- Your site is now live at: `your-project.vercel.app`

### Step 6: Test Your Site

1. Click "Visit" button
2. Check public homepage loads
3. Go to `/admin/login`
4. Login with default credentials
5. Test adding a donation

---

## Method 2: Deploy from Command Line

For developers comfortable with terminal.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

- Enter your email
- Check email for verification link
- Click the link

### Step 3: Deploy

```bash
cd temple-website
vercel
```

Answer the prompts:
- Set up and deploy? **Y**
- Which scope? (choose your account)
- Link to existing project? **N**
- Project name? **temple-website**
- Directory? **./** (just press Enter)
- Override settings? **N**

### Step 4: Add Environment Variables

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
```

Paste the value when prompted.

Repeat for each variable:
```bash
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
vercel env add NEXT_PUBLIC_CLOUDINARY_API_KEY
vercel env add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

---

## Connecting Custom Domain

Once deployed, connect your domain: lakshmichennakeshavaswamy.com

### Step 1: Add Domain in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Click "Settings"
4. Click "Domains"
5. Enter: `lakshmichennakeshavaswamy.com`
6. Click "Add"

### Step 2: Configure DNS

Vercel will show you DNS records to add. There are two options:

**Option A: Using A Records (Recommended)**

Add these A records at your domain registrar:

```
Type: A
Name: @ (or leave blank for root domain)
Value: 76.76.21.21

Type: A  
Name: www
Value: 76.76.21.21
```

**Option B: Using CNAME**

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Wait for Propagation

- DNS changes take 24-48 hours
- Check status in Vercel → Domains
- When ready, you'll see ✅ "Valid Configuration"

### Popular Domain Registrars - How to Add DNS Records

**GoDaddy:**
1. Login to GoDaddy
2. My Products → Domains
3. Click your domain → Manage DNS
4. Click "Add" under Records
5. Add the A/CNAME records from Vercel

**Namecheap:**
1. Login to Namecheap
2. Domain List → Manage
3. Advanced DNS tab
4. Add New Record
5. Add the A/CNAME records from Vercel

**Google Domains:**
1. Login to Google Domains
2. Click your domain
3. DNS tab
4. Custom records
5. Add the A/CNAME records from Vercel

---

## Updating Your Website

### If Using GitHub:

1. Make changes to code
2. Push to GitHub
3. Vercel automatically redeploys!

```bash
git add .
git commit -m "Updated donation form"
git push
```

### If Using CLI:

```bash
vercel --prod
```

---

## Monitoring & Analytics

### View Deployment Logs

1. Vercel Dashboard → Your Project
2. Click "Deployments"
3. Click any deployment
4. View build logs and errors

### Check Performance

1. Vercel Dashboard → Your Project
2. Click "Analytics" tab
3. See visitor stats (requires Pro plan, optional)

---

## Troubleshooting

### Build Failed

**Error:** "Module not found"
- Check `package.json` has all dependencies
- Try: `npm install` locally first

**Error:** "Environment variable not found"
- Verify all env variables are added in Vercel
- Check spelling matches exactly

### Site Not Loading

1. Check deployment succeeded (green checkmark)
2. Check domain DNS is configured correctly
3. Wait 5 minutes, try hard refresh (Ctrl+F5)
4. Check browser console for errors

### Changes Not Showing

1. Hard refresh: Ctrl+F5 or Cmd+Shift+R
2. Clear browser cache
3. Wait 2-3 minutes for deployment
4. Check Vercel shows latest deployment

### Domain Not Working

1. Verify DNS records are correct
2. Wait 24-48 hours for propagation
3. Test with: https://dnschecker.org
4. Check Vercel shows "Valid Configuration"

---

## Security Checklist

After deployment, verify:

- [ ] Environment variables are in Vercel (not in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] Never committed passwords to GitHub
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Changed default admin passwords
- [ ] Firebase security rules are published

---

## Backup & Recovery

### Backup Code

```bash
cd temple-website
zip -r temple-backup-$(date +%Y%m%d).zip .
```

### Backup Data

1. Firebase Console → Firestore
2. Three dots menu → Export
3. Save to Google Cloud Storage

### Rollback Deployment

1. Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click three dots → "Promote to Production"

---

## Cost Monitoring

Vercel Free Tier Includes:
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Custom domain
- ✅ Edge functions

**Your temple website will NEVER exceed free tier!**

But you can monitor usage:
1. Vercel Dashboard → Settings → Usage
2. Check bandwidth used
3. Typical temple site uses < 1GB/month

---

## Getting Help

**Vercel Documentation:**
- https://vercel.com/docs

**Vercel Support:**
- Free tier: Community support only
- Pro plan: Email support (not needed for temple)

**Community:**
- Vercel Discord: https://vercel.com/discord
- GitHub Discussions: Post in your repo

---

## Next Steps After Deployment

1. ✅ Share public URL with community
2. ✅ Add site to Google Search Console (optional)
3. ✅ Print QR code for easy mobile access
4. ✅ Set up automatic backups
5. ✅ Train other admins how to use it

---

**Your website is now live and accessible worldwide! 🎉**

Public URL: `https://lakshmichennakeshavaswamy.com`  
Admin URL: `https://lakshmichennakeshavaswamy.com/admin/login`

**May this bring transparency and trust to your temple project! 🙏**
