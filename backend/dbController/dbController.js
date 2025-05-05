import { MongoClient } from 'mongodb';

const mongoConfig = {
    serverUrl: 'mongodb://localhost:27017',
    database: 'smartWarehouse'
};

let _connection;
let _db;

export async function connectToDb() {
    if (!_connection) {
        _connection = new MongoClient(mongoConfig.serverUrl);
        await _connection.connect();
        _db = _connection.db(mongoConfig.database);
    }
    return _db;
}
