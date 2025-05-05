import {dbConnection} from './mongoConnection.js';

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
const products = getCollectionFn('products');
const transactions = getCollectionFn('transactions');
const auditLogs = getCollectionFn('auditLogs');
const notifications = getCollectionFn('notifications');
const restockSuggestions = getCollectionFn('restockSuggestions');

export {users, products, transactions, auditLogs, notifications, restockSuggestions};