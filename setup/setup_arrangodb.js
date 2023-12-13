const { Database } = require('arangojs');

const db = new Database({
  url: 'http://localhost:8529',
  databaseName: '_system',
  auth: { username: 'root', password: 'my_password' },
});

async function createCollection(collectionName) {
  const collection = db.collection(collectionName);
  const exists = await collection.exists();
  if (!exists) {
    await collection.create();
    console.log(`Collection '${collectionName}' created.`);
  } else {
    console.log(`Collection '${collectionName}' already exists.`);
  }
}

try {
    createCollection('business');
    createCollection('review');
    createCollection('user');
    createCollection('tip');
    createCollection('passwords');
    console.log("Collections created!");
} catch (e) {
    console.error(`Failed to create collections ${e}`)
}
