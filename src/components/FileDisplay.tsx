import React, { useState, useEffect } from 'react';
import { useFiles } from '../context/FileContext';
import { FileItem } from '../types';
import { getFileIcon } from './Icons';
import { formatFileSize, formatDate } from '../utils/formatters';
import { MoreVertical, Download, Edit2, Trash2, Eye } from 'lucide-react';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'motion/react';

interface FileComponentsProps {
  files: FileItem[];
  onRename: (item: FileItem) => void;
  onDelete: (item: FileItem) => void;
  onPreview: (item: FileItem) => void;
}

const FileCard: React.FC<{ item: FileItem; onRename: (i: FileItem) => void; onDelete: (i: FileItem) => void; onPreview: (i: FileItem) => void; onContext: (e: React.MouseEvent, i: FileItem) => void }> = ({ item, onRename, onDelete, onPreview, onContext }) => {
  const { setCurrentFolderId } = useFiles();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative flex flex-col p-5 bg-slate-900/40 border border-slate-800 rounded-2xl hover:bg-slate-800/40 hover:border-indigo-500/50 transition-all cursor-pointer backdrop-blur-md"
      onContextMenu={(e) => onContext(e, item)}
      onDoubleClick={() => item.type === 'folder' ? setCurrentFolderId(item.id) : onPreview(item)}
    >
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 shadow-sm",
          item.type === 'folder' ? 'bg-indigo-500/10 text-indigo-500' 
                                 : 'bg-slate-800/80 text-slate-400'
        )}>
          {getFileIcon(item.type, "w-7 h-7")}
        </div>
        <h3 className="text-sm font-medium text-center truncate w-full px-2 text-white" title={item.name}>
          {item.name}
        </h3>
      </div>
      
      <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-800/50 text-xs font-medium text-slate-500">
        <span>{item.type === 'folder' ? '--' : formatFileSize(item.size)}</span>
        <span>{formatDate(item.modifiedAt)}</span>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <button 
           onClick={(e) => onContext(e, item)}
           className="p-1.5 rounded-lg transition-colors backdrop-blur bg-slate-900/80 hover:bg-slate-800"
         >
           <MoreVertical className="w-4 h-4 text-slate-400 hover:text-slate-200" />
         </button>
      </div>
    </motion.div>
  );
};

const FileListItem: React.FC<{ item: FileItem; onRename: (i: FileItem) => void; onDelete: (i: FileItem) => void; onPreview: (i: FileItem) => void; onContext: (e: React.MouseEvent, i: FileItem) => void }> = ({ item, onRename, onDelete, onPreview, onContext }) => {
  const { setCurrentFolderId } = useFiles();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="group relative flex items-center px-4 py-3 bg-slate-900/40 border-b last:border-b-0 border-slate-800 hover:bg-slate-800/40 transition-colors cursor-pointer"
      onContextMenu={(e) => onContext(e, item)}
      onDoubleClick={() => item.type === 'folder' ? setCurrentFolderId(item.id) : onPreview(item)}
      onClick={(e) => {
        // Only open on single click for list view if prefered, but we'll stick to double-click for consistency
      }}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-transform group-hover:scale-105",
        item.type === 'folder' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-800/80 text-slate-400'
      )}>
        {getFileIcon(item.type, "w-5 h-5")}
      </div>
      
      <div className="flex-1 min-w-0 pr-4">
        <h3 className="text-sm font-medium text-slate-200 truncate">{item.name}</h3>
      </div>
      
      <div className="hidden sm:block w-32 text-xs text-slate-500 shrink-0">
        {formatDate(item.modifiedAt)}
      </div>
      
      <div className="hidden sm:block w-24 text-xs text-slate-500 shrink-0 text-right">
        {item.type === 'folder' ? '--' : formatFileSize(item.size)}
      </div>

      <div className="w-10 flex justify-end shrink-0 relative">
        <button 
          onClick={(e) => onContext(e, item)}
          className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 hover:bg-slate-800"
        >
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </motion.div>
  );
};

export const FileGrid: React.FC<FileComponentsProps> = ({ files, onRename, onDelete, onPreview }) => {
  const { viewMode, downloadFile } = useFiles();
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: FileItem } | null>(null);

  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleContextMenuClick = (e: React.MouseEvent, item: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  return (
    <>
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <div className="w-32 h-32 mb-6 text-slate-800 animate-pulse">
               <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 20 h30 l15 15 v45 h-45 z" />
               </svg>
            </div>
            <p className="text-lg font-medium text-slate-400">This folder is empty</p>
            <p className="text-sm text-slate-500 mt-1">Drag and drop files to upload</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {files.map(item => (
              <FileCard key={item.id} item={item} onRename={onRename} onDelete={onDelete} onPreview={onPreview} onContext={handleContextMenuClick} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
            {files.map(item => (
              <FileListItem key={item.id} item={item} onRename={onRename} onDelete={onDelete} onPreview={onPreview} onContext={handleContextMenuClick} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {contextMenu && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] z-50 py-1 overflow-hidden backdrop-blur-md" 
            style={{ 
              top: Math.min(contextMenu.y, window.innerHeight - 200), 
              left: Math.min(contextMenu.x, window.innerWidth - 200) 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.item.type !== 'folder' && (
              <>
                <button onClick={() => { onPreview(contextMenu.item); setContextMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700 flex items-center gap-3 transition-colors text-slate-200">
                  <Eye className="w-4 h-4 text-slate-400" /> Preview
                </button>
                <button onClick={() => { downloadFile(contextMenu.item.id); setContextMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700 flex items-center gap-3 transition-colors text-slate-200">
                  <Download className="w-4 h-4 text-slate-400" /> Download
                </button>
              </>
            )}
            <button onClick={() => { onRename(contextMenu.item); setContextMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700 flex items-center gap-3 transition-colors text-slate-200">
              <Edit2 className="w-4 h-4 text-slate-400" /> Rename
            </button>
            <div className="h-px bg-slate-700 my-1 mx-2" />
            <button onClick={() => { onDelete(contextMenu.item); setContextMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-3 transition-colors">
              <Trash2 className="w-4 h-4 text-rose-500" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
