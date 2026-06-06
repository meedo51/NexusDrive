import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { BreadcrumbsBar } from './components/BreadcrumbsBar';
import { FileGrid } from './components/FileDisplay';
import { UploadZone } from './components/UploadZone';
import { CreateFolderModal, RenameModal, DeleteModal, PreviewModal, SettingsModal } from './components/Modals';
import { FileProvider, useFiles } from './context/FileContext';
import { FileItem } from './types';
import { HardDrive, AlertTriangle, ShieldAlert, X } from 'lucide-react';

const FileManagerApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<FileItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FileItem | null>(null);
  const [itemToPreview, setItemToPreview] = useState<FileItem | null>(null);
  
  const { displayedFiles, isSupported, rootHandle, needsPermission, connectStorage, grantPermission, rootName, error, setError } = useFiles();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  return (
    <div className="flex h-screen w-full bg-[#020617] font-sans text-slate-200 overflow-hidden selection:bg-indigo-500/30">
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Topbar 
          onOpenSidebar={() => setSidebarOpen(true)} 
          onCreateFolder={() => setCreateFolderOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        
        <UploadZone>
          <div className="flex-1 flex flex-col overflow-hidden">
            <BreadcrumbsBar />
            <div className="flex-1 overflow-y-auto">
              <FileGrid 
                onRename={setItemToRename} 
                onDelete={setItemToDelete}
                onPreview={setItemToPreview}
              />
            </div>
          </div>
        </UploadZone>
      </div>

      <CreateFolderModal isOpen={createFolderOpen} onClose={() => setCreateFolderOpen(false)} />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <RenameModal item={itemToRename} onClose={() => setItemToRename(null)} />
      <DeleteModal item={itemToDelete} onClose={() => setItemToDelete(null)} />
      <PreviewModal item={itemToPreview} onClose={() => setItemToPreview(null)} />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden max-w-sm"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-red-200 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 p-1">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <FileProvider>
      <FileManagerApp />
    </FileProvider>
  );
}
