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
const transactions = getCollectionFn('transactions');
const auditLogs = getCollectionFn('auditLogs');
const notifications = getCollectionFn('notifications');
const restockSuggestions = getCollectionFn('restockSuggestions');

export { users, inventory, transactions, auditLogs, notifications, restockSuggestions };