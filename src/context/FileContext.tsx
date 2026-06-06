import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { db } from '../db/db';
import { FileItem, FileType, ViewMode, SortBy, SortOrder } from '../types';

interface FileContextType {
  files: FileItem[];
  currentFolderId: string | null;
  searchQuery: string;
  filterType: FileType | 'all';
  sortBy: SortBy;
  sortOrder: SortOrder;
  viewMode: ViewMode;
  displayedFiles: FileItem[];
  breadcrumbs: FileItem[];
  
  setCurrentFolderId: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setFilterType: (t: FileType | 'all') => void;
  setSortBy: (s: SortBy) => void;
  setSortOrder: (o: SortOrder) => void;
  setViewMode: (v: ViewMode) => void;
  
  createFolder: (name: string) => void;
  uploadFiles: (files: File[]) => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  downloadFile: (id: string) => void;
  exportZip: () => Promise<void>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const allFiles = useLiveQuery(() => db.files.toArray(), []) || [];
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FileType | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const breadcrumbs = useMemo(() => {
    const crumbs: FileItem[] = [];
    let current = allFiles.find(f => f.id === currentFolderId);
    while (current) {
      crumbs.unshift(current);
      current = allFiles.find(f => f.id === current?.folderId);
    }
    return crumbs;
  }, [allFiles, currentFolderId]);

  const displayedFiles = useMemo(() => {
    let result = [...allFiles];

    if (searchQuery.trim()) {
      result = result.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    } else {
      result = result.filter(f => f.folderId === currentFolderId);
    }

    if (filterType !== 'all') {
      result = result.filter(f => f.type === filterType);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      } else if (sortBy === 'date') {
        comparison = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
      }

      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (b.type === 'folder' && a.type !== 'folder') return 1;

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allFiles, currentFolderId, searchQuery, filterType, sortBy, sortOrder]);

  const createFolder = useCallback(async (name: string) => {
    const newFolder: FileItem = {
      id: crypto.randomUUID(),
      name,
      type: 'folder',
      size: 0,
      modifiedAt: new Date().toISOString(),
      folderId: currentFolderId,
    };
    await db.files.add(newFolder);
  }, [currentFolderId]);

  const uploadFiles = useCallback(async (files: File[]) => {
    const items: FileItem[] = files.map(file => {
      let type: FileType = 'other';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type === 'application/pdf' || file.type.includes('document') || file.type.includes('text')) type = 'document';

      return {
        id: crypto.randomUUID(),
        name: file.name,
        type,
        size: file.size,
        modifiedAt: new Date().toISOString(),
        folderId: currentFolderId,
        blob: file
      };
    });
    await db.files.bulkAdd(items);
  }, [currentFolderId]);

  const deleteFile = useCallback(async (id: string) => {
    const idsToDelete = new Set<string>();
    const gatherChildren = async (parentId: string) => {
      idsToDelete.add(parentId);
      const children = await db.files.where('folderId').equals(parentId).toArray();
      for (const child of children) {
        await gatherChildren(child.id);
      }
    };
    await gatherChildren(id);
    await db.files.bulkDelete(Array.from(idsToDelete));
  }, []);

  const renameFile = useCallback(async (id: string, newName: string) => {
    await db.files.update(id, { name: newName, modifiedAt: new Date().toISOString() });
  }, []);

  const downloadFile = useCallback(async (id: string) => {
    const file = await db.files.get(id);
    if (file && file.blob) {
      saveAs(file.blob, file.name);
    }
  }, []);

  const exportZip = useCallback(async () => {
    const zip = new JSZip();
    const all = await db.files.toArray();
    
    const addFilesToZip = (folderId: string | null, currentZip: JSZip) => {
      const children = all.filter(f => f.folderId === folderId);
      for (const child of children) {
        if (child.type === 'folder') {
          const newZipFolder = currentZip.folder(child.name);
          if (newZipFolder) addFilesToZip(child.id, newZipFolder);
        } else if (child.blob) {
          currentZip.file(child.name, child.blob);
        }
      }
    };
    
    addFilesToZip(null, zip);
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'NexusDrive_Export.zip');
  }, []);

  return (
    <FileContext.Provider value={{
      files: allFiles, currentFolderId, searchQuery, filterType, sortBy, sortOrder, viewMode, displayedFiles, breadcrumbs,
      setCurrentFolderId, setSearchQuery, setFilterType, setSortBy, setSortOrder, setViewMode,
      createFolder, uploadFiles, deleteFile, renameFile, downloadFile, exportZip
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
