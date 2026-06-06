import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFiles } from '../context/FileContext';

export const UploadZone: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { uploadFiles } = useFiles();

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) uploadFiles(acceptedFiles);
    },
    noClick: true,
    noKeyboard: true
  });

  return (
    <div {...getRootProps()} className="relative flex-1 flex flex-col min-h-0 outline-none">
      <input {...getInputProps()} />
      {children}
      
      <AnimatePresence>
        {isDragActive && (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]/60 backdrop-blur-[2px] m-4 rounded-3xl"
          >
             <div className="absolute inset-0 border-4 border-dashed border-indigo-500/50 rounded-3xl pointer-events-none" />
             <motion.div 
               initial={{ scale: 0.9 }}
               animate={{ scale: 1 }}
               className="bg-[#0B0F1A] border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 text-center pointer-events-none"
             >
               <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-10 h-10" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Drop files here</h2>
                  <p className="text-slate-400">Release to upload immediately to local storage</p>
               </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
