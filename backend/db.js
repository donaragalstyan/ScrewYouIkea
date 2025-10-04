const { MongoClient, GridFSBucket } = require('mongodb');

let _client;
let _db;
let _bucket;

async function connectMongo(uri, dbName, bucketName) {
  if (_client) return { client: _client, db: _db, bucket: _bucket };

  _client = new MongoClient(uri, { maxPoolSize: 10 });
  await _client.connect();

  _db = _client.db(dbName);
  _bucket = new GridFSBucket(_db, { bucketName: bucketName || 'uploads' });

  return { client: _client, db: _db, bucket: _bucket };
}

function getMongo() {
  if (!_client) throw new Error('Mongo not connected yet. Call connectMongo first.');
  return { client: _client, db: _db, bucket: _bucket };
}

module.exports = { connectMongo, getMongo };
