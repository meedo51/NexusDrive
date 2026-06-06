import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fileApi } from '../api/client';
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
  const [rootHandle, setRootHandle] = useState<any>(true); // Mock handling
  const [needsPermission, setNeedsPermission] = useState(false);
  const [rootName, setRootName] = useState<string>('Server Storage');

  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FileType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = async (pathArr: string[]) => {
    try {
      const pathStr = '/' + pathArr.join('/');
      const items = await fileApi.listFiles(pathStr);
      setFiles(items);
      setCurrentPath(pathArr);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load dir', err);
      setError(err.message || 'Failed to load directory');
    }
  };

  useEffect(() => {
    loadDirectory([]);
  }, []);

  const connectStorage = async () => {
    await loadDirectory([]);
  };

  const grantPermission = async () => {
    setNeedsPermission(false);
  };

  const disconnectStorage = async () => {
    // Cannot disconnect server storage
    toast.error("Cannot disconnect from remote server storage");
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
      else if (sortBy === 'date') comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();

      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (b.type === 'folder' && a.type !== 'folder') return 1;

      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [files, searchQuery, filterType, sortBy, sortOrder]);

  const createFolder = async (name: string) => {
    try {
      const folderPath = '/' + [...currentPath, name].join('/');
      await fileApi.createFolder(folderPath);
      await loadDirectory(currentPath);
      toast.success("Folder created");
    } catch (e: any) {
      toast.error(e.message || "Failed to create folder");
    }
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    try {
      const pathStr = '/' + currentPath.join('/');
      toast.promise(
        fileApi.uploadFiles(pathStr, filesToUpload),
        {
          loading: `Uploading ${filesToUpload.length} file(s)...`,
          success: () => {
            loadDirectory(currentPath);
            return 'Upload complete';
          },
          error: 'Upload failed'
        }
      );
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Upload failed");
    }
  };

  const deleteFile = async (item: FileItem) => {
    try {
      await fileApi.deleteItem(item.path);
      await loadDirectory(currentPath);
      toast.success("Deleted successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete item");
    }
  };

  const renameFile = async (item: FileItem, newName: string) => {
    if (item.name === newName) return;
    try {
      await fileApi.renameItem(item.path, newName);
      await loadDirectory(currentPath);
      toast.success("Renamed successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to rename item");
    }
  };

  const downloadFile = (item: FileItem) => {
    if (item.type === 'folder') {
      toast.error("Downloading folders not supported yet");
      return;
    }
    const url = fileApi.getDownloadUrl(item.path);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const interceptSetCurrentPath = (path: string[]) => {
    loadDirectory(path);
  };

  return (
    <FileContext.Provider value={{
      isSupported, rootHandle, needsPermission, rootName, files, currentPath, searchQuery, filterType, sortBy, sortOrder, viewMode, displayedFiles, error, setError,
      connectStorage, grantPermission, disconnectStorage, setCurrentPath: interceptSetCurrentPath, setSearchQuery, setFilterType, setSortBy, setSortOrder, setViewMode,
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
