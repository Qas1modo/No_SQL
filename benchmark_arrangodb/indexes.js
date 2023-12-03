const { Database } = require('arangojs');

// Connect to your ArangoDB instance
const db = new Database({ url: 'http://localhost:8529', databaseName: '_system' });
db.useBasicAuth('root', 'your_password');

// Define the collection
const reviewsCollection = db.collection('reviews');

// Create a full-text index on the 'text' field
async function createFullTextIndex() {
  try {
    const index = await reviewsCollection.createFulltextIndex(['text']);
    console.log('Full-text index created:', index);
  } catch (error) {
    console.error('Failed to create full-text index:', error.message);
  }
}

createFullTextIndex();
