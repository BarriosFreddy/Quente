import Dexie from 'dexie';

export const quenteDB = new Dexie('quenteDB');
quenteDB.version(1).stores({
  items: '&_id, name, code', // Primary key and indexed props
  billings: '++id, &_id'
});