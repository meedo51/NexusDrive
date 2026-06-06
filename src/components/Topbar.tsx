import React, { useRef } from 'react';
import { useFiles } from '../context/FileContext';
import { Search, LayoutGrid, List, Menu, Plus, Upload, DownloadCloud } from 'lucide-react';

export const Topbar: React.FC<{ onOpenSidebar: () => void; onCreateFolder: () => void }> = ({ onOpenSidebar, onCreateFolder }) => {
  const { searchQuery, setSearchQuery, viewMode, setViewMode, uploadFiles, exportZip } = useFiles();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  return (
    <header className="h-20 flex items-center justify-between px-4 md:px-8 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-30">
      <div className="flex items-center gap-4 w-full md:w-auto flex-1">
        <button onClick={onOpenSidebar} className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 transition">
          <Menu className="w-5 h-5 text-slate-400" />
        </button>
        
        {/* Search Bar */}
        <div className="relative group w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-full bg-slate-900 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200 transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 ml-4">
        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        
        <button onClick={() => fileInputRef.current?.click()} className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors text-white shadow-lg shadow-indigo-500/20">
          <Upload className="w-4 h-4" /> Upload
        </button>

        <button onClick={onCreateFolder} className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors text-white">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Folder</span>
        </button>

        <button onClick={exportZip} className="p-2 ml-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Export as ZIP">
          <DownloadCloud className="w-5 h-5" />
        </button>
        
        <div className="h-8 w-px bg-slate-800 mx-1 hidden sm:block" />

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 hidden sm:flex">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-200'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
