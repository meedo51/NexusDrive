import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileItem } from '../types';
import { FolderPlus, Pencil, AlertTriangle, X } from 'lucide-react';
import { useFiles } from '../context/FileContext';

const ModalBackdrop: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-[#020617]/60 backdrop-blur-sm"
  >
    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm">
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
      renameFile(item.id, name.trim());
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
      deleteFile(item.id);
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
