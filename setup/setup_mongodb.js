const { MongoClient } = require('mongodb');

// MongoDB URL and credentials
const url = 'mongodb://root:my_password@localhost:27017';
const client = new MongoClient(url);

// Database and collection names
const dbName = 'yelp_db';
const collections = ['business', 'review', 'user', 'tip'];

async function createCollections() {
    try {
        // Connect to the MongoDB client
        await client.connect();
        console.log('Connected successfully to server');

        const db = client.db(dbName);

        // Create each collection
        for (const collectionName of collections) {
            await db.createCollection(collectionName);
            console.log(`Collection created: ${collectionName}`);
        }
    } catch (err) {
        console.log('An error occurred:', err);
    } finally {
        // Close the connection
        await client.close();
        console.log('Connection closed');
    }
}

createCollections();
