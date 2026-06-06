import React from 'react';
import { useFiles } from '../context/FileContext';
import { HardDrive, FileText, Image, Film, FileQuestion, Archive } from 'lucide-react';
import { cn } from '../utils/cn';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { filterType, setFilterType, rootName } = useFiles();

  const navItems = [
    { label: 'All Files', icon: HardDrive, filter: 'all' as const },
    { label: 'Documents', icon: FileText, filter: 'document' as const },
    { label: 'Images', icon: Image, filter: 'image' as const },
    { label: 'Videos', icon: Film, filter: 'video' as const },
    { label: 'Other', icon: FileQuestion, filter: 'other' as const },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-[#020617]/50 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={onClose} />
      )}
      
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0B0F1A] border-r border-slate-800 transition-transform duration-300 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center gap-3 px-6 py-6 h-20 border-b border-slate-800/60 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-xl relative overflow-hidden group shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            N
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">NexusLocal</span>
        </div>
        
        <div className="px-6 py-6 border-b border-slate-800/60 shrink-0">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Storage Root</div>
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-900 rounded-lg border border-slate-800 text-sm font-medium text-slate-300">
             <Archive className="w-4 h-4 text-indigo-400" />
             <span className="truncate">{rootName}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-3">
            Filters
          </div>
          {navItems.map((item) => (
            <button
              key={item.filter}
              onClick={() => {
                setFilterType(item.filter);
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                filterType === item.filter 
                  ? "bg-indigo-500/10 text-indigo-400" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};
