import express from "express";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import archiver from "archiver";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;
let STORAGE_PATH = process.env.STORAGE_PATH || '/home/u761138213/domains/nexus.s2u.me/public_html/data';

try {
  if (!fsSync.existsSync(STORAGE_PATH)) {
    fsSync.mkdirSync(STORAGE_PATH, { recursive: true });
  }
} catch (e) {
  console.warn(`Could not create ${STORAGE_PATH}, using local fallback.`);
  STORAGE_PATH = path.resolve("./storage");
  if (!fsSync.existsSync(STORAGE_PATH)) {
    fsSync.mkdirSync(STORAGE_PATH, { recursive: true });
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// API Key check (optional)
const requireApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const expectedKey = process.env.API_KEY;
  if (!expectedKey) return next();
  const providedKey = req.headers["x-api-key"] || req.query.apiKey;
  if (providedKey !== expectedKey) {
    res.status(401).json({ error: "Unauthorized. Invalid API Key." });
    return;
  }
  next();
};

app.use("/api", requireApiKey);

// Utility for safe paths
const getSafePath = (userPath: string) => {
  // Normalize and prevent directory traversal
  const normalizedPath = path.normalize(userPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const securedPath = path.join(STORAGE_PATH, normalizedPath);
  
  if (!securedPath.startsWith(STORAGE_PATH)) {
    throw new Error("Path traversal detected.");
  }
  return securedPath;
};

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const parentDir = req.body.path || "/";
      const safeDir = getSafePath(parentDir);
      if (!fsSync.existsSync(safeDir)) {
        fsSync.mkdirSync(safeDir, { recursive: true });
      }
      cb(null, safeDir);
    } catch (e: any) {
      cb(e, "");
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 52428800 }
});

// GET list files
app.get("/api/files", async (req, res) => {
  try {
    const relativePath = (req.query.path as string) || "/";
    const safePath = getSafePath(relativePath);
    
    if (!fsSync.existsSync(safePath)) {
      res.status(404).json({ error: "Directory not found" });
      return;
    }
    
    const items = await fs.readdir(safePath, { withFileTypes: true });
    
    const processedItems = await Promise.all(items.map(async (item) => {
      const itemPath = path.join(safePath, item.name);
      let stat;
      try {
        stat = await fs.stat(itemPath);
      } catch (e) {
        return null; // Skip if inaccessible
      }
      
      const isDir = item.isDirectory();
      return {
        id: item.name + "-" + stat.mtimeMs, // Mock ID
        name: item.name,
        type: isDir ? 'folder' : getFileCategory(item.name),
        size: isDir ? 0 : stat.size,
        lastModified: stat.mtime,
        path: path.join(relativePath, item.name).replace(/\\/g, "/")
      };
    }));
    
    res.json(processedItems.filter(Boolean));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Helper for file type
function getFileCategory(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) return 'image';
  if (['.mp4', '.avi', '.mov', '.webm'].includes(ext)) return 'video';
  if (['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
  if (['.pdf', '.doc', '.docx', '.txt', '.md', '.csv', '.json', '.js', '.ts', '.css', '.html'].includes(ext)) return 'document';
  return 'other';
}

// GET download file
app.get("/api/download", async (req, res) => {
  try {
    const relativePath = req.query.path as string;
    if (!relativePath) {
      res.status(400).json({ error: "Path is required" });
      return;
    }
    const safePath = getSafePath(relativePath);
    
    if (!fsSync.existsSync(safePath)) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    
    res.download(safePath);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET file info
app.get("/api/info", async (req, res) => {
  try {
    const relativePath = req.query.path as string;
    if (!relativePath) return res.status(400).json({ error: "Path required" });
    const safePath = getSafePath(relativePath);
    if (!fsSync.existsSync(safePath)) return res.status(404).json({ error: "Not found" });
    
    const stat = await fs.stat(safePath);
    res.json({
      name: path.basename(safePath),
      size: stat.size,
      lastModified: stat.mtime,
      isDirectory: stat.isDirectory()
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST upload
app.post("/api/upload", upload.array("files"), (req, res) => {
  res.json({ message: "Files uploaded successfully", count: req.files?.length });
});

// POST create folder
app.post("/api/folder", async (req, res) => {
  try {
    const folderPath = req.body.path;
    const safePath = getSafePath(folderPath);
    
    if (fsSync.existsSync(safePath)) {
      res.status(400).json({ error: "Folder already exists" });
      return;
    }
    
    await fs.mkdir(safePath, { recursive: true });
    res.json({ message: "Folder created" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT rename
app.put("/api/rename", async (req, res) => {
  try {
    const oldPath = getSafePath(req.body.oldPath);
    // newName is just the name, not full path
    const parentDir = path.dirname(oldPath);
    const newPath = path.join(parentDir, req.body.newName);
    
    // Quick sanitize for newName
    const safeNewName = path.basename(req.body.newName);
    const resolvedNewPath = path.join(parentDir, safeNewName);
    
    if (!fsSync.existsSync(oldPath)) {
      res.status(404).json({ error: "Source not found" });
      return;
    }
    if (fsSync.existsSync(resolvedNewPath)) {
      res.status(400).json({ error: "Destination already exists" });
      return;
    }
    
    await fs.rename(oldPath, resolvedNewPath);
    res.json({ message: "Renamed successfully" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE delete
app.delete("/api/delete", async (req, res) => {
  try {
    const targetPath = getSafePath(req.body.path);
    
    if (!fsSync.existsSync(targetPath)) {
      res.status(404).json({ error: "File/Folder not found" });
      return;
    }
    
    await fs.rm(targetPath, { recursive: true, force: true });
    res.json({ message: "Deleted successfully" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST move
app.post("/api/move", async (req, res) => {
  try {
    const sourcePath = getSafePath(req.body.sourcePath);
    const destFolder = getSafePath(req.body.destFolder);
    const fileName = path.basename(sourcePath);
    const destPath = path.join(destFolder, fileName);
    
    if (!fsSync.existsSync(sourcePath)) {
      res.status(404).json({ error: "Source not found" });
      return;
    }
    if (fsSync.existsSync(destPath)) {
      res.status(400).json({ error: "Destination already exists" });
      return;
    }
    
    await fs.rename(sourcePath, destPath);
    res.json({ message: "Moved successfully" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST bulk delete
app.post("/api/bulk-delete", async (req, res) => {
  try {
    const paths: string[] = req.body.paths || [];
    for (const p of paths) {
      const targetPath = getSafePath(p);
      if (fsSync.existsSync(targetPath)) {
        await fs.rm(targetPath, { recursive: true, force: true });
      }
    }
    res.json({ message: "Deleted successfully" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST bulk download route
app.post("/api/bulk-download", async (req, res) => {
  try {
    const paths: string[] = req.body.paths || [];
    if (!paths.length) return res.status(400).json({ error: "No paths provided" });

    res.attachment('download.zip');
    const archive = archiver('zip', { zlib: { level: 5 } });
    
    archive.on('error', (err) => { throw err; });
    archive.pipe(res);

    for (const p of paths) {
      const targetPath = getSafePath(p);
      if (fsSync.existsSync(targetPath)) {
        const stat = fsSync.statSync(targetPath);
        if (stat.isDirectory()) {
          archive.directory(targetPath, path.basename(targetPath));
        } else {
          archive.file(targetPath, { name: path.basename(targetPath) });
        }
      }
    }
    await archive.finalize();
  } catch (e: any) {
    // Only send error if headers not sent
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
});


// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
