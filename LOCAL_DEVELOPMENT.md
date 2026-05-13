# Local Development & Testing Guide

Test your temple website on your computer before deploying to Vercel.

---

## Prerequisites

You need Node.js installed on your computer.

### Check if Node.js is installed:

```bash
node --version
```

If you see a version number (like v18.0.0), you're good!

If not, download from: https://nodejs.org (choose LTS version)

---

## Setup for Local Development

### Step 1: Install Dependencies

Open terminal/command prompt and navigate to project folder:

```bash
cd temple-website
npm install
```

This will install all required packages. Takes 2-3 minutes.

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

**On Mac/Linux:**
```bash
cp .env.example .env.local
```

**On Windows:**
```bash
copy .env.example .env.local
```

2. Edit `.env.local` and add your actual Firebase and Cloudinary credentials

### Step 3: Run Development Server

```bash
npm run dev
```

Your website will start at: http://localhost:3000

---

## Testing Locally

### Test Public Website

1. Open browser: http://localhost:3000
2. Check homepage loads
3. Verify stats show (will be 0 if fresh)
4. Check responsive design (resize browser window)

### Test Admin Panel

1. Go to: http://localhost:3000/admin/login
2. Login with: `kiran` / `kiran123`
3. Test each tab:
   - ✅ Overview shows stats
   - ✅ Add Donation works
   - ✅ Receipt generates
   - ✅ Add Expense works
   - ✅ Transactions list shows
   - ✅ Manage Admins (if super admin)

### Test on Mobile (while on same WiFi)

1. Find your computer's local IP:

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

Look for "IPv4 Address" (usually starts with 192.168)

2. On your phone, visit: `http://YOUR_IP:3000`

Example: `http://192.168.1.5:3000`

---

## Common Local Development Commands

### Start development server:
```bash
npm run dev
```

### Build for production (test build):
```bash
npm run build
```

### Run production build locally:
```bash
npm run build
npm run start
```

### Stop server:
- Press `Ctrl+C` in terminal

---

## Making Changes

### Modify Homepage

Edit: `app/page.js`

Changes appear immediately (hot reload).

### Modify Admin Dashboard

Edit: `app/admin/dashboard/page.js`

### Modify Admin Login

Edit: `app/admin/login/page.js`

### Modify Styles

Edit: `app/globals.css`

Or use Tailwind classes directly in components.

---

## Testing Firebase Connection

### Test 1: Check Firebase Config

Add this to any page temporarily:

```javascript
console.log('Firebase config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});
```

Check browser console (F12) - values should appear.

### Test 2: Test Authentication

Try logging in. If it works, Firebase connection is good!

### Test 3: Test Firestore

Add a donation. Check Firebase Console → Firestore.
New document should appear in `donations` collection.

---

## Testing Cloudinary Connection

1. Upload a photo in admin panel
2. Check Cloudinary Dashboard
3. Image should appear in `temple-construction` folder

---

## Debugging Tips

### View Browser Console

- **Chrome/Edge:** Press F12 → Console tab
- **Safari:** Develop menu → Show JavaScript Console
- Look for red error messages

### Common Errors

**Error: "Cannot find module"**
```bash
npm install
```

**Error: "PORT 3000 already in use"**
```bash
# Kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill

# Windows:
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

**Error: "Firebase: Error (auth/...)"**
- Check Firebase credentials in `.env.local`
- Verify Firebase Authentication is enabled

**Error: "Network request failed"**
- Check internet connection
- Verify Firebase project has billing enabled (free tier is fine)

---

## Before Deploying to Vercel

### Pre-Deployment Checklist

- [ ] Test all features locally
- [ ] Test on phone (mobile view)
- [ ] Verify Firebase connection works
- [ ] Verify Cloudinary upload works
- [ ] Build succeeds: `npm run build`
- [ ] No errors in console
- [ ] `.env.local` is in `.gitignore`
- [ ] Environment variables documented

### Test Production Build

```bash
npm run build
npm run start
```

Visit: http://localhost:3000

If this works, Vercel deployment will work!

---

## File Structure

```
temple-website/
├── app/
│   ├── page.js                    # Public homepage
│   ├── layout.js                  # Root layout
│   ├── globals.css                # Global styles
│   └── admin/
│       ├── login/
│       │   └── page.js           # Admin login
│       └── dashboard/
│           └── page.js           # Admin dashboard
├── lib/
│   └── firebase.js               # Firebase configuration
├── public/                       # Static files (images, etc.)
├── .env.local                    # Environment variables (NOT in git)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind CSS config
└── README.md                     # Documentation
```

---

## Updating Dependencies

Check for updates:
```bash
npm outdated
```

Update all:
```bash
npm update
```

Update specific package:
```bash
npm update next
```

---

## Performance Testing

### Test Load Speed

```bash
npm run build
npm run start
```

Use browser DevTools:
- Network tab → Check load times
- Lighthouse tab → Run audit
- Aim for 90+ performance score

### Optimize Images

If uploading large photos:
1. Resize before upload (max 1920px width)
2. Compress using: https://tinypng.com
3. Cloudinary auto-optimizes, but smaller = faster

---

## Git Workflow (if using version control)

### First commit:
```bash
git init
git add .
git commit -m "Initial commit"
```

### After making changes:
```bash
git status                    # See what changed
git add .                     # Stage all changes
git commit -m "Added X feature"
git push                      # Push to GitHub (if connected)
```

### Create backup:
```bash
git tag v1.0.0
git push --tags
```

---

## Troubleshooting Local Development

### Issue: Changes not reflecting

**Solution:**
1. Stop server (Ctrl+C)
2. Delete `.next` folder
3. Restart: `npm run dev`

### Issue: "EADDRINUSE" error

**Solution:** Port 3000 is busy
```bash
# Use different port
npm run dev -- -p 3001
```

### Issue: Styles not working

**Solution:**
1. Check `tailwind.config.js` is present
2. Verify `globals.css` has Tailwind directives
3. Restart dev server

---

## Environment-Specific Testing

### Test with Production Firebase

Use production Firebase in `.env.local`

### Test with Test Firebase

Create separate Firebase project for testing:
1. Create new project: `temple-tracker-test`
2. Use test credentials in `.env.local`
3. Never affect production data!

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm update` | Update packages |

| URL | Page |
|-----|------|
| `localhost:3000` | Public homepage |
| `localhost:3000/admin/login` | Admin login |
| `localhost:3000/admin/dashboard` | Admin panel |

---

## Getting Help

**Official Docs:**
- Next.js: https://nextjs.org/docs
- Firebase: https://firebase.google.com/docs
- Tailwind: https://tailwindcss.com/docs

**Common Issues:**
- Check browser console (F12)
- Check terminal for errors
- Google the exact error message

---

**Happy coding! 🚀**

Once everything works locally, you're ready to deploy to Vercel!
