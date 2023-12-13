# Benchmark of ArrangoDB

## Setup

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Docker**: You need Docker to run the ArangoDB instance. [Download Docker](https://www.docker.com/products/docker-desktop).

2. **Node.js and npm**: These are required for running the JavaScript script to create collections in ArangoDB. [Download Node.js (npm included)](https://nodejs.org/en/download/).\
Run the following script to install modules.
```bash
   npm install
```
3. **Python**: Python is used for running the visualization script.

### Setting Up ArangoDB

1. **Start ArangoDB Container**
   - Navigate to the directory containing your `arangodb.yml`.
   - Run the following command to start the ArangoDB container:
     ```bash
     docker-compose -f arangodb.yml up -d
     ```
   - This command will start the ArangoDB instance in detached mode.

2. **Set Up MongoDB**
   - Create collections for dataset:
     ```bash
     node setup/setup_arrangodb.js
     ```

3. **Import Yelp Dataset into ArangoDB**
   - Use the `docker exec` command to import the Yelp dataset into ArangoDB.
   - Import the business data:
     ```bash
     docker exec pa195-arangodb-arangodb-1 arangoimport --file /tmp/yelp_dataset/yelp_academic_dataset_business.json --type json --collection business --server.password my_password
     ```
   - Import the review data:
     ```bash
     docker exec pa195-arangodb-arangodb-1 arangoimport --file /tmp/yelp_dataset/yelp_academic_dataset_review.json --type json --collection review --server.password my_password
     ```

4. **Import Key-value Dataset into ArangoDB**
   - Use the `docker exec` command to import the Yelp dataset into ArangoDB.
   - Import the business data:
     ```bash
     docker exec pa195-arangodb-arangodb-1 arangoimport --file /tmp/kv_dataset/passwords.json --type json --collection passwords --server.password my_password
     ```

### Setting Up MongoDB

1. **Start MongoDB Container**
   - Run the following command to start the MongoDB container:
     ```bash
     docker-compose -f mongodb.yml up -d
     ```

2. **Initial Setup Script**
   - Create collections for dataset:
     ```bash
     node setup/setup_mongodb.js
     ```

3. **Import Yelp Dataset into MongoDB**
   - Use the `docker exec` command to import the Yelp dataset into MongoDB.
   - Import the business data:
     ```bash
     docker exec -it pa195-arangodb-mongodb-1 mongoimport --username root --password my_password --authenticationDatabase admin --db yelp_db --collection business --type json --file /tmp/yelp_dataset/yelp_academic_dataset_business.json
     ```
   - Import the review data:
     ```bash
     docker exec -it pa195-arangodb-mongodb-1 mongoimport --username root --password my_password --authenticationDatabase admin --db yelp_db --collection review --type json --file /tmp/yelp_dataset/yelp_academic_dataset_review.json
     ```

### Setting Up Redis

1. **Start Redis Container**
   - Navigate to the directory containing your `redis.yml`.
   - Run the following command to start the Redis container:
     ```bash
     docker-compose -f redis.yml up -d
     ```
   - This command will start the Redis instance in detached mode.

## Running the Benchmarks

### Benchmark ArangoDB

```bash
node benchmark_arrangodb/queries.js
```

This script will run a series of predefined queries against the ArangoDB instance and collect performance metrics.

### Benchmark MongoDB

Similarly, to benchmark MongoDB, use the following command:

```bash
node benchmark_mongodb/queries.js
```

This will execute a set of queries tailored for MongoDB and gather relevant performance data.

### Benchmark Redis

For Redis, use official benchmark in the container

```bash
docker exec pa195-arango-redis-1 sh -c 'for I in 1 10 1000; do redis-benchmark -n ${I} -t get; done'
```

Put the average values into benchmark_redis/queries.csv

### Visualize Benchmark Results

Once you have collected the benchmark data from both databases, use the provided Python script to visualize and compare the results:

```bash
python visualization/visualize.py
python visualization/visualize_redis.py
```
