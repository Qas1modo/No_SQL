const { MongoClient } = require('mongodb');
const now = require('performance-now');
const fs = require('fs');
const path = require('path');

const url = 'mongodb://root:my_password@localhost:27017';
const client = new MongoClient(url, {});

async function executeQuery(collection, query) {
  const start = now();
  let res = null;
  // Check if query is an aggregation pipeline or a simple find query
  if (Array.isArray(query)) {
    await collection.aggregate(query).toArray();
  } else {
    await collection.find(query).toArray();
  }
  const end = now();
  return end - start;
}

async function benchmarkQuery(collection, query, repetitions = 10) {
  let totalExecutionTime = 0;

  for (let i = 0; i < repetitions; i++) {
    const timeTaken = await executeQuery(collection, query);
    totalExecutionTime += timeTaken;
  }

  return totalExecutionTime / repetitions; // Average time
}

async function runBenchmarks() {
  await client.connect();
  const db = client.db('yelp_db'); // Replace with your MongoDB database name
  const businessCollection = db.collection('business');
  const reviewCollection = db.collection('review'); // If you have a separate reviews collection

  const queries = [
    {
      name: 'Filtering Businesses',
      query: { city: 'San Francisco', stars: { $gte: 4.5 } },
    },
    {
      name: 'Aggregate Businesses',
      query: [
        { $unwind: '$categories' },
        { $group: { _id: '$categories', averageStars: { $avg: '$stars' } } },
        { $project: { category: '$_id', averageStars: 1, _id: 0 } },
      ],
    },
    {
      name: 'Join Businesses and Reviews',
      query: [
        { $match: { city: 'San Francisco' } },
        { $lookup: {
            from: 'review',
            localField: '_key',
            foreignField: 'business_id',
            as: 'reviews',
          },
        },
        { $unwind: '$reviews' },
        { $project: { business: '$$ROOT', review: '$reviews', _id: 0 } },
      ],
    },
    {
      name: 'Full Text Search',
      query: { city: { $regex: "San"} } // Case-insensitive regex search
    }
  ];

  const results = [['database', 'query_name', 'avg_time']];


  console.log("Creating index");
  // Create text index for text search on the 'city' field
  await businessCollection.createIndex({ city: "text" });

  for (let query of queries) {
    let collection = businessCollection; // Default to business collection
    if (query.name === 'Join Businesses and Reviews') {
      // Adjust if a different collection is needed
      collection = businessCollection;
    }

    const averageTime = await benchmarkQuery(collection, query.query);
    results.push(['mongodb', query.name, averageTime.toFixed(2)]);
  }

  // Drop the text index after benchmarking
  await businessCollection.dropIndex("city_text");

  const csvContent = results.map(e => e.join(',')).join('\n');
  fs.writeFileSync(path.join(__dirname, 'queries.csv'), csvContent);
  console.log('Benchmark results written to queries_mongodb.csv');

  await client.close();
}

runBenchmarks();
