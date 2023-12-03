const { Database, aql } = require('arangojs');
const now = require('performance-now');
const fs = require('fs');
const path = require('path');

const db = new Database({
  url: 'http://localhost:8529',
  databaseName: '_system',
  auth: { username: 'root', password: 'my_password' },
});

async function executeQuery(query) {
  const start = now();
  const cursor = await db.query(query);
  await cursor.all(); // We don't need the result for benchmarking
  const end = now();
  return end - start;
}

async function benchmarkQuery(query, repetitions = 10) {
  let totalExecutionTime = 0;

  for (let i = 0; i < repetitions; i++) {
    const timeTaken = await executeQuery(query);
    totalExecutionTime += timeTaken;
  }

  return totalExecutionTime / repetitions; // Average time
}


async function runBenchmarks() {
  const queries = [
    {
      name: 'Filtering Businesses',
      aql: aql`
        FOR business IN business
          FILTER business.city == 'San Francisco' AND business.stars >= 4.5
          RETURN business
      `,
    },
    {
      name: 'Aggregate Businesses',
      aql: aql`
        FOR business IN business
          COLLECT category = business.categories INTO group
          RETURN {
            category,
            averageStars: AVERAGE(group[*].business.stars)
          }
      `,
    },
    {
      name: 'Join Businesses and Reviews',
      aql: aql`
        FOR business IN business
          FILTER business.city == 'San Francisco'
          FOR review IN review
            FILTER review.business_id == business._key
            RETURN { business, review }
      `,
    },
    {
      name: 'Full Text Search',
      aql: aql`
        FOR business IN business
          FILTER CONTAINS(business.city, 'San')
          RETURN business
      `,
    }
  ];

  const results = [['database', 'query_name', 'avg_time']];

  const businessCollection = db.collection('business');

  console.log("Creating index")
  // Create index for text search
  const index = await businessCollection.ensureIndex({
    type: 'fulltext',
    fields: ['city'],
    minLength: 2
  });

  for (let query of queries) {
    console.log(`Running: ${query.name}`);
    const averageTime = await benchmarkQuery(query.aql);
    results.push(['arangodb', query.name, averageTime.toFixed(2)]);
  }

  if (index.id) {
    await businessCollection.dropIndex(index.id);
  }

  const csvContent = results.map(e => e.join(',')).join('\n');
  fs.writeFileSync(path.join(__dirname, 'queries.csv'), csvContent);
  console.log('Benchmark results written to benchmarkResults.csv');
}

runBenchmarks();
