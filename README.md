# Nexus File Hub

Nexus File Hub is a production-ready File Manager App built for Hostinger Cloud Startup's Node.js Web App feature.

## Features
- **Modern React + Vite Frontend:** Clean UI crafted with Tailwind CSS and glassmorphic touches.
- **Express Backend:** Uses standard Node.js libraries (`fs/promises`, `multer`) to read and write to standard real folders.
- **Real persistence:** Uploaded files exist in real standard directories. 
- **Bulk Operations:** Download Multiple as ZIP and Delete Multiple directly via API.
- **Path Verification:** Prevents path traversal vulnerabilities so they cannot escape the storage root.

## Hostinger Node.js Deployment Specifications

This application uses the EXACT folder as the main storage root:
`/home/u761138213/domains/nexus.s2u.me/public_html/data/`

### Step 1: Prepare Files
```bash
# On your local machine, build the frontend
cd frontend
npm run build
# Copy dist/ contents to your Hostinger domain's public_html folder
```

### Step 2: Upload Backend to Hostinger
```bash
# Using FTP or Hostinger File Manager
# Upload backend/ folder contents to:
# /home/u761138213/domains/nexus.s2u.me/node-app/
```

### Step 3: Configure Node.js Web App in Hostinger
1. Go to Hostinger Control Panel → Advanced → Node.js
2. Set Application Root: `/node-app`
3. Set Entry Point: `server.js` (Or `server.cjs` if using our bundled version)
4. Set Environment Variables (paste from .env.example)
5. Click "Start Application"

### Step 4: Ensure Storage Folder Exists and Has Permissions
```bash
# SSH into Hostinger or use File Manager
mkdir -p /home/u761138213/domains/nexus.s2u.me/public_html/data
chmod 755 /home/u761138213/domains/nexus.s2u.me/public_html/data
```

### Step 5: Test
- Visit `https://nexus.s2u.me`
- The app should load with the file manager UI
- Create a folder, upload a file - all should save to `public_html/data/`

