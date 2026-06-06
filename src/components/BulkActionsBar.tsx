import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Download, X } from 'lucide-react';
import { useFiles } from '../context/FileContext';

export const BulkActionsBar: React.FC = () => {
  const { selectedIds, clearSelection, bulkDeleteSelected, bulkDownloadSelected } = useFiles();
  
  return (
    <AnimatePresence>
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700/50 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-6 z-50 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
              {selectedIds.size}
            </div>
            <span className="text-slate-200 font-medium whitespace-nowrap">items selected</span>
          </div>
          
          <div className="w-px h-6 bg-slate-700/50" />
          
          <div className="flex items-center gap-3">
            <button
              onClick={bulkDownloadSelected}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" /> Download ZIP
            </button>
            <button
              onClick={bulkDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
          
          <div className="w-px h-6 bg-slate-700/50" />
          
          <button
            onClick={clearSelection}
            className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
