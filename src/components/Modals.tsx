import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileItem } from '../types';
import { FolderPlus, Pencil, AlertTriangle, X } from 'lucide-react';
import { useFiles } from '../context/FileContext';

const ModalBackdrop: React.FC<{ children: React.ReactNode; onClose: () => void; className?: string }> = ({ children, onClose, className = "max-w-sm" }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#020617]/80 backdrop-blur-sm"
  >
    <div onClick={(e) => e.stopPropagation()} className={`w-full ${className}`}>
      {children}
    </div>
  </motion.div>
);

export const CreateFolderModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const { createFolder } = useFiles();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createFolder(name.trim());
      setName('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop onClose={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[#0B0F1A] rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-white"><FolderPlus className="w-5 h-5 text-indigo-500" /> New Folder</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <input type="text" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 outline-none transition-all font-medium" />
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={!name.trim()} className="px-5 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">Create</button>
              </div>
            </form>
          </motion.div>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
};

export const RenameModal: React.FC<{ item: FileItem | null; onClose: () => void }> = ({ item, onClose }) => {
  const [name, setName] = useState('');
  const { renameFile } = useFiles();

  React.useEffect(() => { if (item) setName(item.name); }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && item) {
      renameFile(item, name.trim());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <ModalBackdrop onClose={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[#0B0F1A] rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-white"><Pencil className="w-5 h-5 text-indigo-500" /> Rename</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <input type="text" autoFocus value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 outline-none transition-all font-medium" />
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={!name.trim() || name === item.name} className="px-5 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">Save</button>
              </div>
            </form>
          </motion.div>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
};

export const DeleteModal: React.FC<{ item: FileItem | null; onClose: () => void }> = ({ item, onClose }) => {
  const { deleteFile } = useFiles();

  const confirmDelete = () => {
    if (item) {
      deleteFile(item);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <ModalBackdrop onClose={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[#0B0F1A] rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-white">Delete {item.type === 'folder' ? 'Folder' : 'File'}?</h3>
              <p className="text-slate-400 text-sm">
                Are you sure you want to delete <span className="font-semibold text-slate-200">"{item.name}"</span>? {item.type === 'folder' && "This will also remove all files inside it."} This action cannot be undone.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <button onClick={onClose} className="flex-1 px-5 py-2.5 rounded-xl font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 px-5 py-2.5 rounded-xl font-medium bg-rose-600 text-white hover:bg-rose-500 transition-colors shadow-sm">Delete</button>
              </div>
            </div>
          </motion.div>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
};

export const PreviewModal: React.FC<{ item: FileItem | null; onClose: () => void }> = ({ item, onClose }) => {
  const [textContent, setTextContent] = React.useState<string | null>(null);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!item || item.type === 'folder') {
      setObjectUrl(null);
      setTextContent(null);
      return;
    }

    if (item.blob) {
      if (item.blob.type.startsWith('text/') || item.name.match(/\.(md|json|csv|txt|tsx|ts|js|html|css)$/i)) {
         item.blob.text().then(text => setTextContent(text)).catch(() => setTextContent("Error reading text."));
      } else {
        const url = URL.createObjectURL(item.blob);
        setObjectUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
  }, [item]);

  if (!item) return null;

  return (
    <AnimatePresence>
      {item && (
        <ModalBackdrop onClose={onClose} className="max-w-5xl">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[#0B0F1A] rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/50">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-white truncate pr-4">{item.name}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white flex-shrink-0"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-0 overflow-auto bg-slate-950/50 flex items-center justify-center min-h-[50vh]">
              {item.type === 'image' && objectUrl && (
                <img src={objectUrl} alt={item.name} className="max-w-full max-h-[70vh] object-contain" />
              )}
              {item.type === 'video' && objectUrl && (
                <video src={objectUrl} controls className="max-w-full max-h-[70vh] outline-none" />
              )}
              {item.name.match(/\.pdf$/i) && objectUrl && (
                <iframe src={objectUrl} className="w-full h-[70vh] border-none" title={item.name} />
              )}
              {textContent !== null && (
                <pre className="whitespace-pre-wrap text-sm text-slate-300 p-6 overflow-auto max-h-[70vh] w-full font-mono">
                  {textContent}
                </pre>
              )}
              {!objectUrl && textContent === null && item.type !== 'image' && item.type !== 'video' && !item.name.match(/\.pdf$/i) && (
                <div className="p-8 text-slate-500 flex flex-col items-center">
                  <AlertTriangle className="w-12 h-12 mb-4 text-slate-700" />
                  <p>Preview not available for this file type.</p>
                </div>
              )}
            </div>
          </motion.div>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
};

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { rootName, disconnectStorage } = useFiles();

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalBackdrop onClose={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-[#0B0F1A] rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-white">Settings</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Storage Location</h4>
              <div className="flex items-center justify-between bg-slate-900 rounded-xl border border-slate-800 p-4">
                <div className="flex flex-col min-w-0 mr-4">
                   <span className="text-slate-400 text-xs font-medium mb-1">Current Root Folder</span>
                   <strong className="text-slate-200 text-sm truncate">{rootName}</strong>
                </div>
                <button 
                  onClick={() => { onClose(); disconnectStorage(); }}
                  className="shrink-0 px-4 py-2 font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors text-sm"
                >
                  Change Location
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Changing your storage location will disconnect the current folder. Don't worry, your physical files won't be deleted.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-slate-800/60 bg-slate-900/30 flex justify-end">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors">Done</button>
            </div>
          </motion.div>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
};
