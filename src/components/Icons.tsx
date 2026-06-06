import React from 'react';
import { Folder, FileText, Image as ImageIcon, Film, FileQuestion } from 'lucide-react';
import { FileType } from '../types';

export const getFileIcon = (type: FileType, className?: string) => {
  switch (type) {
    case 'folder':
      return <Folder className={className} fill="currentColor" opacity={0.8} />;
    case 'document':
      return <FileText className={className} />;
    case 'image':
      return <ImageIcon className={className} />;
    case 'video':
      return <Film className={className} />;
    default:
      return <FileQuestion className={className} />;
  }
};
