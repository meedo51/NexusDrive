import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, FileQuestion, Image as ImageIcon } from 'lucide-react';
import { FileItem } from '../types';

export const PreviewModal: React.FC<{ item: FileItem | null; onClose: () => void }> = ({ item, onClose }) => {
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    if (item && item.blob) {
      if (item.type === 'document' && item.name.match(/\.(txt|md|csv|json)$/i)) {
        const reader = new FileReader();
        reader.onload = (e) => setTextContent(e.target?.result as string);
        reader.readAsText(item.blob);
      } else {
        const url = URL.createObjectURL(item.blob);
        setContentUrl(url);
      }
    }
    return () => {
      if (contentUrl) URL.revokeObjectURL(contentUrl);
      setContentUrl(null);
      setTextContent(null);
    };
  }, [item]);

  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl h-full max-h-[85vh] bg-[#0B0F1A] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-[#020617]/50 backdrop-blur-md">
            <h2 className="text-lg font-medium text-white truncate pr-4">{item.name}</h2>
            <div className="flex items-center gap-2">
              {contentUrl && (
                <a href={contentUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors" title="Open in new tab">
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#020617]">
            {item.type === 'folder' ? (
              <div className="text-center text-slate-500">
                <FileQuestion className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Cannot preview folders directly.</p>
              </div>
            ) : item.type === 'image' && contentUrl ? (
              <img src={contentUrl} alt={item.name} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
            ) : item.type === 'video' && contentUrl ? (
              <video src={contentUrl} controls className="max-w-full max-h-full rounded-lg shadow-lg" autoPlay />
            ) : item.type === 'document' && contentUrl && item.name.toLowerCase().endsWith('.pdf') ? (
              <iframe src={`${contentUrl}#toolbar=0`} className="w-full h-full rounded-lg bg-white" title={item.name} />
            ) : textContent !== null ? (
              <pre className="w-full h-full p-6 text-sm text-slate-300 font-mono whitespace-pre-wrap overflow-auto bg-slate-900 rounded-xl border border-slate-800">
                {textContent}
              </pre>
            ) : (
              <div className="text-center text-slate-500">
                <FileQuestion className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-slate-300">Preview not available</p>
                <p className="mt-2 text-sm text-slate-400">This file type is not supported for inline preview.<br/>Download the file to view its contents.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
