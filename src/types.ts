export type FileType = 'folder' | 'document' | 'image' | 'video' | 'audio' | 'other';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'size' | 'date';
export type SortOrder = 'asc' | 'desc';

export interface FileItem {
  id: string; // usually path
  name: string;
  type: FileType;
  size: number;
  lastModified: string; // ISO string from server
  path: string; // relative path string
}
