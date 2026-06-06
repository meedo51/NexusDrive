import Dexie, { Table } from 'dexie';
import { FileItem } from '../types';

export class AppDB extends Dexie {
  files!: Table<FileItem, string>;

  constructor() {
    super('NexusFilesDB');
    this.version(1).stores({
      files: 'id, folderId, type, name'
    });
  }
}

export const db = new AppDB();
