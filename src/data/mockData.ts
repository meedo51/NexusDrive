import { FileItem } from '../types';

export const initialData: FileItem[] = [
  { id: 'root-1', name: 'Design Assets', type: 'folder', modifiedAt: '2025-06-01T10:00:00Z', folderId: null },
  { id: 'root-2', name: 'Project Alpha', type: 'folder', modifiedAt: '2025-06-02T11:30:00Z', folderId: null },
  { id: 'root-3', name: 'Personal', type: 'folder', modifiedAt: '2025-05-20T08:15:00Z', folderId: null },
  
  { id: 'file-1', name: 'Q3 Financial Report.pdf', type: 'document', size: 2450000, modifiedAt: '2025-06-05T09:00:00Z', folderId: null },
  { id: 'file-2', name: 'Team Kickoff.mp4', type: 'video', size: 105000000, modifiedAt: '2025-06-04T14:20:00Z', folderId: null },
  
  { id: 'file-3', name: 'UI Concept Map.png', type: 'image', size: 4500000, modifiedAt: '2025-06-03T16:45:00Z', folderId: 'root-1' },
  { id: 'file-4', name: 'Brand Guide.pdf', type: 'document', size: 12000000, modifiedAt: '2025-06-01T10:30:00Z', folderId: 'root-1' },
  
  { id: 'file-5', name: 'Alpha Specs v2.docx', type: 'document', size: 1250000, modifiedAt: '2025-06-02T12:00:00Z', folderId: 'root-2' },
  { id: 'file-6', name: 'Architecture Diagram.png', type: 'image', size: 3200000, modifiedAt: '2025-06-02T13:10:00Z', folderId: 'root-2' },
];
