# ServerFS

ServerFS is a production-ready File Manager App that connects to a specific configurable folder on your server as the main storage location. All file operations (upload, rename, delete, folder creation) happen directly within this server directory using a Node.js + Express backend.

## Features
- **Modern React + Vite Frontend:** Clean UI crafted with Tailwind CSS and glassmorphic touches.
- **Express Backend:** Uses standard Node.js libraries (`fs/promises`, `multer`) to read and write to standard real folders.
- **Real persistence:** Uploaded files exist in real standard directories. 
- **Docker Ready:** Spin up with a simple `docker-compose up` command.
- **Path Verification:** Prevents path traversal vulnerabilities so they cannot escape the storage root.

## Quick Start (Docker - Recommended)

The simplest way is to spin up using the provided Docker compose configuration which maps the storage internally to `./storage`:

```bash
docker-compose up --build
```
The app will bind to `localhost:3000`.

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

To build the static frontend and compile the backend into a single `server.cjs` file, run:

```bash
npm run build
npm start
```

## Cloud Serverless Deployments (Vercel)

You can deploy to Vercel. A sample `vercel.json` is provided that points the `/api/(.*)` routes to the compiled Node backend server. Run `vercel --prod` to deploy. Make sure to define the `STORAGE_PATH` environment variable in your Vercel Dashboard (though note that Vercel is mostly read-only except for `/tmp`). A persistent volume provider (like DigitalOcean, AWS, Render) is typically better suited for physical-file managers.
