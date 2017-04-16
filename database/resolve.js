import { MongoClient } from 'mongodb';
import warning from 'warning';

import scoped from './scoped';

let _db;

const mockCollection = {
  __MOCK__: true,

  insert: () => {},
};

const mockDB = {
  __MOCK__: true,

  collection: () => Promise.resolve(mockCollection),
  collections: () => Promise.resolve([mockCollection]),
  createCollection: () => Promise.resolve({}),
  createIndex: () => Promise.resolve({}),
  dropCollection: () => Promise.resolve(),
  ensureIndex: () => Promise.resolve({}),
  indexInformation: () => Promise.resolve({}),
  renameCollection: () => Promise.resolve(),
};

const getMongoUrl = () => {
  const url = process.env.MONGO_URL;
  if (url && url.length > 0) {
    return url;
  }
  return false;
};

async function resolve() {
  if (_db) {
    return _db;
  }

  try {
    const url = getMongoUrl() || 'mongodb://localhost:27017/toolbot';
    const db = await MongoClient.connect(url);
    _db = db;
  } catch (err) {
    warning(
      false,
      'failed to connect to mongodb, db instance fallback to empty object.',
    );
    _db = mockDB;
  }
  return _db;
}

async function resolveScoped(scope) {
  const db = await resolve();
  return scoped(db, scope);
}

export default resolve;

export { resolveScoped };