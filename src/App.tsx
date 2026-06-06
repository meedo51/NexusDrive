import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-[#020617] text-slate-200">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-6" />
        <h1 className="text-2xl font-bold mb-2 text-white">Browser Not Supported</h1>
        <p className="text-slate-400">Your browser does not support the File System Access API.</p>
        <p className="text-slate-400">Please use Chrome, Edge, or Opera on desktop.</p>
      </div>
    );
  }

  if (!rootHandle) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-500 mb-8 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <HardDrive className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-white tracking-tight">Nexus Storage</h1>
        <p className="text-slate-400 max-w-md text-center mb-10 leading-relaxed">
          Select a local folder on your computer to serve as the root storage for this application. All files and folders will be created directly on your disk.
        </p>
        <button 
          onClick={connectStorage}
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 active:translate-y-0"
        >
          Select Storage Location
        </button>
      </div>
    );
  }

  if (needsPermission) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-[#020617] text-slate-200">
        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mb-8 border border-amber-500/30">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold mb-4 text-white tracking-tight">Permission Required</h1>
        <p className="text-slate-400 max-w-md text-center mb-8 leading-relaxed">
          Nexus Storage needs permission to access your connected folder: <strong className="text-slate-200">"{rootName}"</strong>
        </p>
        <button 
          onClick={grantPermission}
          className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-all shadow-lg hover:-translate-y-1"
        >
          Grant Permission
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#020617] font-sans text-slate-200 overflow-hidden selection:bg-indigo-500/30">
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
                files={displayedFiles} 
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
