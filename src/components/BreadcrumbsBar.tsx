import React from 'react';
import { useFiles } from '../context/FileContext';
import { ChevronRight, Home } from 'lucide-react';
import { SortBy, SortOrder } from '../types';

export const BreadcrumbsBar: React.FC = () => {
  const { currentPath, setCurrentPath, sortBy, setSortBy, sortOrder, setSortOrder, rootName } = useFiles();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 px-6 md:px-8 border-b border-transparent">
      <nav className="flex items-center space-x-1 text-sm font-medium text-slate-500 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0 hide-scrollbar">
        <button
          onClick={() => setCurrentPath([])}
          className={`px-2 py-1 rounded-md transition-colors flex items-center gap-2 ${currentPath.length === 0 ? 'text-slate-200 bg-slate-900 border border-slate-800' : 'hover:bg-slate-800 hover:text-slate-200'}`}
        >
          <Home className="w-4 h-4" /> {rootName || 'Root'}
        </button>
        
        {currentPath.map((part, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <button
              onClick={() => setCurrentPath(currentPath.slice(0, idx + 1))}
              className={`px-2 py-1 rounded-md transition-colors ${idx === currentPath.length - 1 ? 'text-slate-200 bg-slate-900 border border-slate-800' : 'hover:bg-slate-800 hover:text-slate-200'}`}
            >
              {part}
            </button>
          </React.Fragment>
        ))}
      </nav>

      <div className="flex items-center gap-2 text-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="bg-transparent border-none text-slate-300 py-1 pl-2 pr-8 focus:ring-0 cursor-pointer font-medium text-xs md:text-sm focus:outline-none"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="size">Sort by Size</option>
          </select>
          <div className="h-4 w-px bg-slate-800 mx-1 self-center" />
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 hover:bg-slate-800 rounded transition-colors text-xs font-semibold uppercase text-slate-400 hover:text-slate-200"
          >
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>
    </div>
  );
};
