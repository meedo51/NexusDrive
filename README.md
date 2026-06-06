# Nexus File Hub

Nexus File Hub is a stunning, production-ready File Manager App natively built for Hostinger Cloud Startup's Node.js Web App feature using GitHub automated deployment.

## Features
- **Modern React + Vite Frontend:** Clean UI crafted with Tailwind CSS and glassmorphic touches.
- **Express Backend:** Uses standard Node.js libraries (`fs/promises`, `multer`) to read and write to standard real folders.
- **Real persistence:** Uploaded files exist in real standard directories. 
- **Bulk Operations:** Download Multiple as ZIP and Delete Multiple directly via API.
- **Path Verification:** Prevents path traversal vulnerabilities so they cannot escape the storage root.

## Hostinger GitHub Deployment Specifications

This application uses the EXACT folder as the main storage root:
`/home/u761138213/domains/nexus.s2u.me/public_html/data/`

### Step 1: Push code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/nexus-file-hub.git
git push -u origin main
```

### Step 2: Connect to Hostinger
1. Log into Hostinger control panel
2. Go to your domain (`nexus.s2u.me`) → **Node.js**
3. Click **Connect from Git** or **Deploy from GitHub**
4. Authorize Hostinger to access your GitHub
5. Select repository: `nexus-file-hub`
6. Select branch: `main`
7. Set **Build Command**: `npm run build`
8. Set **Start Command**: `npm start`
9. Set **Environment Variables**:
   - `PORT=3000` (Hostinger may set this automatically)
   - `NODE_ENV=production`
10. Click **Deploy**

### Step 3: Create storage folder
By SSH or Hostinger File Manager to ensure the folder exists:
```bash
mkdir -p /home/u761138213/domains/nexus.s2u.me/public_html/data
chmod 755 /home/u761138213/domains/nexus.s2u.me/public_html/data
```

### Step 4: Test
- Visit `https://nexus.s2u.me`
- The app should load with the file manager UI
- Create a folder, upload a file - all should save to `public_html/data/`

## Local Development (Without Docker)

You will need Node.js >= 18 installed.

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Review `.env.example` and create a `.env` file. You can leave the default storage path or change it:
   ```env
   STORAGE_PATH=./storage
   PORT=3000
   ```

3. **Run Dev server (Full stack):**
   ```bash
   npm run dev
   ```

## Production Build

To build the static frontend and compile the backend into a single `server.cjs` file manually, run:

```bash
npm run build
npm start
```


