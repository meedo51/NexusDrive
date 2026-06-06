import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { BreadcrumbsBar } from './components/BreadcrumbsBar';
import { FileGrid } from './components/FileDisplay';
import { UploadZone } from './components/UploadZone';
import { CreateFolderModal, RenameModal, DeleteModal } from './components/Modals';
import { PreviewModal } from './components/PreviewModal';
import { FileProvider, useFiles } from './context/FileContext';
import { FileItem } from './types';

const FileManagerApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<FileItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FileItem | null>(null);
  const [itemToPreview, setItemToPreview] = useState<FileItem | null>(null);
  
  const { displayedFiles } = useFiles();

  return (
    <div className="flex h-screen w-full bg-[#020617] font-sans text-slate-200 overflow-hidden selection:bg-indigo-500/30">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Topbar 
          onOpenSidebar={() => setSidebarOpen(true)} 
          onCreateFolder={() => setCreateFolderOpen(true)}
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
      <RenameModal item={itemToRename} onClose={() => setItemToRename(null)} />
      <DeleteModal item={itemToDelete} onClose={() => setItemToDelete(null)} />
      <PreviewModal item={itemToPreview} onClose={() => setItemToPreview(null)} />
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
