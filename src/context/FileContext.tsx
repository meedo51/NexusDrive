import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { saveAs } from 'file-saver';
import { db } from '../db/db';
import { FileItem, FileType, ViewMode, SortBy, SortOrder } from '../types';

interface FileContextType {
  isSupported: boolean;
  rootHandle: any;
  needsPermission: boolean;
  rootName: string;

  files: FileItem[];
  currentPath: string[]; // array of subfolder names
  searchQuery: string;
  filterType: FileType | 'all';
  sortBy: SortBy;
  sortOrder: SortOrder;
  viewMode: ViewMode;
  displayedFiles: FileItem[];
  error: string | null;
  setError: (e: string | null) => void;
  
  connectStorage: () => Promise<void>;
  grantPermission: () => Promise<void>;
  disconnectStorage: () => Promise<void>;

  setCurrentPath: (path: string[]) => void;
  setSearchQuery: (q: string) => void;
  setFilterType: (t: FileType | 'all') => void;
  setSortBy: (s: SortBy) => void;
  setSortOrder: (o: SortOrder) => void;
  setViewMode: (v: ViewMode) => void;
  
  createFolder: (name: string) => Promise<void>;
  uploadFiles: (files: File[]) => Promise<void>;
  deleteFile: (item: FileItem) => Promise<void>;
  renameFile: (item: FileItem, newName: string) => Promise<void>;
  downloadFile: (item: FileItem) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSupported, setIsSupported] = useState(true);
  const [rootHandle, setRootHandle] = useState<any>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [rootName, setRootName] = useState<string>('');

  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FileType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!('showDirectoryPicker' in window)) {
      setIsSupported(false);
      return;
    }
    db.settings.get('root-handle').then(async (record) => {
      if (record && record.handle) {
        const handle = record.handle;
        setRootName(handle.name);
        try {
          const perm = await handle.queryPermission({ mode: 'readwrite' });
          if (perm === 'granted') {
            setRootHandle(handle);
            loadDirectory(handle, []);
          } else {
            setRootHandle(handle);
            setNeedsPermission(true);
          }
        } catch (e) {
          console.error("Permission query failed:", e);
        }
      }
    });
  }, []);

  const resolvePath = async (root: any, path: string[]) => {
    let curr = root;
    for (const part of path) {
      curr = await curr.getDirectoryHandle(part);
    }
    return curr;
  };

  const loadDirectory = async (root: any, path: string[]) => {
    try {
      const dir = await resolvePath(root, path);
      const items: FileItem[] = [];
      // @ts-ignore
      for await (const [name, handle] of dir.entries()) {
        if (handle.kind === 'file') {
          const file = await handle.getFile();
          let type: FileType = 'other';
          if (file.type.startsWith('image/')) type = 'image';
          else if (file.type.startsWith('video/')) type = 'video';
          else if (file.type === 'application/pdf' || file.name.match(/\\.(doc|docx|txt|md|csv|json)$/i)) type = 'document';

          items.push({
             id: [...path, name].join('/'),
             name, type, size: file.size,
             modifiedAt: new Date(file.lastModified).toISOString(),
             handle, blob: file
          });
        } else if (handle.kind === 'directory') {
          items.push({
             id: [...path, name].join('/'),
             name, type: 'folder', size: 0,
             modifiedAt: new Date().toISOString(),
             handle
          });
        }
      }
      setFiles(items);
      setCurrentPath(path);
    } catch (err) {
      console.error('Failed to load dir', err);
    }
  };

  const connectStorage = async () => {
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await db.settings.put({ id: 'root-handle', handle });
      setRootHandle(handle);
      setRootName(handle.name);
      setNeedsPermission(false);
      await loadDirectory(handle, []);
    } catch (e) {
      console.warn('User aborted or error:', e);
    }
  };

  const grantPermission = async () => {
    if (!rootHandle) return;
    try {
      const perm = await rootHandle.requestPermission({ mode: 'readwrite' });
      if (perm === 'granted') {
        setNeedsPermission(false);
        await loadDirectory(rootHandle, currentPath);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const disconnectStorage = async () => {
    await db.settings.clear();
    setRootHandle(null);
    setRootName('');
    setFiles([]);
    setCurrentPath([]);
  };

  const displayedFiles = useMemo(() => {
    let result = [...files];
    if (searchQuery.trim()) {
      result = result.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (filterType !== 'all') {
      result = result.filter(f => f.type === filterType);
    }
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'size') comparison = a.size - b.size;
      else if (sortBy === 'date') comparison = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();

      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (b.type === 'folder' && a.type !== 'folder') return 1;

      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [files, searchQuery, filterType, sortBy, sortOrder]);

  const createFolder = async (name: string) => {
    try {
      const dir = await resolvePath(rootHandle, currentPath);
      await dir.getDirectoryHandle(name, { create: true });
      await loadDirectory(rootHandle, currentPath);
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to create folder. It might already exist.");
    }
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    try {
      const dir = await resolvePath(rootHandle, currentPath);
      for (const f of filesToUpload) {
        const fileHandle = await dir.getFileHandle(f.name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(f);
        await writable.close();
      }
      await loadDirectory(rootHandle, currentPath);
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to upload files. Check permissions or disk space.");
    }
  };

  const deleteFile = async (item: FileItem) => {
    try {
      const dir = await resolvePath(rootHandle, currentPath);
      await dir.removeEntry(item.name, { recursive: true });
      await loadDirectory(rootHandle, currentPath);
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to delete item.");
    }
  };

  const copyDirectory = async (sourceDir: any, destDir: any) => {
    for await (const [name, handle] of sourceDir.entries()) {
      if (handle.kind === 'file') {
        const sourceFile = await handle.getFile();
        const destFileHandle = await destDir.getFileHandle(name, { create: true });
        const writable = await destFileHandle.createWritable();
        await writable.write(sourceFile);
        await writable.close();
      } else if (handle.kind === 'directory') {
        const newDestDir = await destDir.getDirectoryHandle(name, { create: true });
        await copyDirectory(handle, newDestDir);
      }
    }
  };

  const renameFile = async (item: FileItem, newName: string) => {
    if (item.name === newName) return;
    try {
      const dir = await resolvePath(rootHandle, currentPath);
      
      try {
        // @ts-ignore
        if (item.handle.move) {
          // @ts-ignore
          await item.handle.move(newName);
          await loadDirectory(rootHandle, currentPath);
          setError(null);
          return;
        }
      } catch (e) {
        console.warn("Native move failed, falling back to manual copy", e);
      }

      if (item.type === 'folder') {
        const newDirHandle = await dir.getDirectoryHandle(newName, { create: true });
        await copyDirectory(item.handle, newDirHandle);
        await dir.removeEntry(item.name, { recursive: true });
      } else {
        const file = await item.handle.getFile();
        const newHandle = await dir.getFileHandle(newName, { create: true });
        const writable = await newHandle.createWritable();
        await writable.write(file);
        await writable.close();
        await dir.removeEntry(item.name);
      }
      await loadDirectory(rootHandle, currentPath);
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to rename item. Name might conflict.");
    }
  };

  const downloadFile = (item: FileItem) => {
    if (item.blob) saveAs(item.blob, item.name);
  };

  return (
    <FileContext.Provider value={{
      isSupported, rootHandle, needsPermission, rootName, files, currentPath, searchQuery, filterType, sortBy, sortOrder, viewMode, displayedFiles, error, setError,
      connectStorage, grantPermission, disconnectStorage, setCurrentPath, setSearchQuery, setFilterType, setSortBy, setSortOrder, setViewMode,
      createFolder, uploadFiles, deleteFile, renameFile, downloadFile
    }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) throw new Error('useFiles must be used within FileProvider');
  return context;
};
