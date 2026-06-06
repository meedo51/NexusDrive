export type FileType = 'folder' | 'document' | 'image' | 'video' | 'other';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'size' | 'date';
export type SortOrder = 'asc' | 'desc';

export interface FileItem {
  id: string; // usually path
  name: string;
  type: FileType;
  size: number;
  modifiedAt: string; // ISO string
  handle: any; // FileSystemHandle
  blob?: File; // Native File
}
