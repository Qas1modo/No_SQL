const { MongoClient } = require('mongodb');
const now = require('performance-now');
const fs = require('fs');
const path = require('path');

const url = 'mongodb://root:my_password@localhost:27017';
const client = new MongoClient(url, {});

async function executeQuery(collection, field, order) {
    const start = now();
    const index = await collection.createIndex(
      { [field]: order}, { name: field});
    const end = now();
    return end - start;
}

async function benchmarkQuery(collection, field, order, repetitions = 5) {
  let totalExecutionTime = 0;

  for (let i = 0; i < repetitions; i++) {
    console.log(`Progress: ${i + 1}/${repetitions}`);
    const timeTaken = await executeQuery(collection, field, order);
    if (i + 1 < repetitions) {
        await collection.dropIndex(field);
    }
    totalExecutionTime += timeTaken;
  }
  return totalExecutionTime / repetitions; // Average time
}

async function createIndexes() {
  await client.connect();
  const db = client.db('yelp_db'); // Replace with your MongoDB database name
  const businessCollection = db.collection('business');
  const reviewCollection = db.collection('review'); // If you have a separate reviews collection
  
  const results = [['database', 'query_name', 'avg_time']];
  let indexes = [{
        name:"Persistent index string",
        field: "city",
        order: 1
    },
    {
        name:"Persistent index integer",
        field: "review_count",
        order: 1
    },
    {
        name:"Persistent index float",
        field: "longitude",
        order: 1
    }
  ];
  await businessCollection.dropIndexes();
  for (let index of indexes) {
    let collection = businessCollection;
    console.log(`Running: ${index.name}`);
    const averageTime = await benchmarkQuery(collection,
         index.field,
         index.order);
    results.push(['mongodb', index.name, averageTime.toFixed(2)]);
  }

  const csvContent = results.map(e => e.join(',')).join('\n');
  fs.writeFileSync(path.join(__dirname, 'queries.csv'), csvContent);
  console.log('Benchmark results written to queries_mongodb.csv');

  await client.close();
}

async function deleteIndexes() {
    await client.connect();
    const db = client.db('yelp_db');
    const businessCollection = db.collection('business');
    const reviewCollection = db.collection('review');
    await businessCollection.dropIndexes();
    console.log("done")
  }

//deleteIndexes();
createIndexes();
