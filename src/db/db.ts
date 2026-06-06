import Dexie, { Table } from 'dexie';

export class AppDB extends Dexie {
  settings!: Table<{ id: string; handle: any }, string>;

  constructor() {
    super('NexusStoreLocalFS_DB');
    this.version(1).stores({
      settings: 'id'
    });
  }
}

export const db = new AppDB();
