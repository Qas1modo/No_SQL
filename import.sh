#!/bin/bash
container=`sudo docker ps -l --format '{{.ID}}'`
sudo docker rm --force $container

for i in 1 2 3
do
    sudo docker-compose -f arangodb.yml up -d
    sudo node setup/setup_arrangodb.js
    container=`sudo docker ps -l --format '{{.ID}}'`
    sleep 2
    time sudo docker exec $container arangoimport --file /tmp/yelp_dataset/yelp_academic_dataset_business.json --type json --collection business --server.password my_password
    time sudo docker exec $container arangoimport --file /tmp/yelp_dataset/yelp_academic_dataset_review.json --type json --collection review --server.password my_password
    sudo docker rm --force $container
    sudo docker-compose -f mongodb.yml up -d
    sudo node setup/setup_mongodb.js
    sleep 2   
    container=`sudo docker ps --format '{{.ID}}'`
    time sudo docker exec -it $container mongoimport --username root --password my_password --authenticationDatabase admin --db yelp_db --collection business --type json --file /tmp/yelp_dataset/yelp_academic_dataset_business.json
    time sudo docker exec -it $container mongoimport --username root --password my_password --authenticationDatabase admin --db yelp_db --collection review --type json --file /tmp/yelp_dataset/yelp_academic_dataset_review.json
    sudo docker rm --force $container
done