import { dbConnection } from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;
  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }
    return _col;
  };
};

const users = getCollectionFn('users');
const inventory = getCollectionFn('inventory');
const auditLogs = getCollectionFn('auditLogs');
const notifications = getCollectionFn('notifications');

export { users, inventory, auditLogs, notifications };