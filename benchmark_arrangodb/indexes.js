const { Database } = require('arangojs');
const fs = require('fs');
const path = require('path');
const now = require('performance-now');

const db = new Database({
  url: 'http://localhost:8529',
  databaseName: '_system',
  auth: { username: 'root', password: 'my_password' },
});

// Define the collection
const reviewsCollection = db.collection('reviews');
const businessCollection = db.collection('business');

async function measureTime (type, fields, i, repetitions) {
  const start = now();
  const index = await businessCollection.ensureIndex(
    { type: type, fields: fields });
  const end = now();
  if (i + 1 < repetitions) {
    await businessCollection.dropIndex(index.id);
  }
  return end - start;
}

async function benchmarkQuery(type, fields, repetitions = 1) {
  let totalExecutionTime = 0;

  for (let i = 0; i < repetitions; i++) {
    console.log(`Progress: ${i + 1}/${repetitions}`);
    const timeTaken = await measureTime(type, fields, i , repetitions);
    totalExecutionTime += timeTaken;
  }
  return totalExecutionTime / repetitions;
}

async function dropIndexes() {
  (await businessCollection.indexes()).forEach(async i => {
    try {
      if (i.name !== 'primary') {
        console.log(`Deleting index ${i.name}`);
        await businessCollection.dropIndex(i.id)
      }
    }
    catch (error) {
      console.log(`Failed to drop index ${i.name}:`, error.message);
    }
  });
}

async function createIndexes() {

  let indexes = [{
    name:"Persistent index city",
    type: "persistent",
    fields: ["city"]
  },
  {
    name:"Persistent index review_count",
    type: "persistent",
    fields: ["review_count"]
  },
  {
    name:"Persistent index longitude",
    type: "persistent",
    fields: ["longitude"]
  },
  {
    name:"Persistent index postal_code",
    type: "persistent",
    fields: ["postal_code"]
  }];
  await dropIndexes();
  const results = [['database', 'query_name', 'avg_time']];
  for (let index of indexes) {
    try {
      console.log(`Running: ${index.name}`);
      const averageTime = await benchmarkQuery(index.type, index.fields);
      results.push(['arangodb', index.name, averageTime.toFixed(2)]);
    } catch (error) {
      console.error(`Failed to create index ${index.name}:`, error.message);
    }
  }
  const csvContent = results.map(e => e.join(',')).join('\n');
  fs.writeFileSync(path.join(__dirname, 'queries.csv'), csvContent);
  console.log('Benchmark results written to benchmarkResults.csv');
}


dropIndexes();
//createIndexes();
