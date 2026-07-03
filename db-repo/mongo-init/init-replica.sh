#!/bin/bash
set -e

# start temporal process
mongod --port "$DB_PORT" --replSet "$REPLICA" --bind_ip_all --fork --logpath /var/log/mongodb.log

# Waiting for DB start
until mongosh --port "$DB_PORT" --eval "db.adminCommand({ping: 1})" &>/dev/null; do
    sleep 2
done

#  Replica initialization
mongosh --port "$DB_PORT" --eval "rs.initiate({_id: '$REPLICA', members: [{_id: 0, host: '$DB_HOST:' + '$DB_PORT'}]})"

# Waiting for node to become PRIMARY to write the data
until mongosh --port "$DB_PORT" --eval "db.hello().isWritablePrimary" | grep -q "true"; do
    sleep 2
done

# Create users and populate data in DB
mongosh --port "$DB_PORT" <<EOF
use $DB_NAME

db.createUser({ user: "$READER_NAME", pwd: "$READER_PASS", roles: [{ role: "read", db: "$DB_NAME" }] });
db.createUser({ user: "$WRITER_NAME", pwd: "$WRITER_PASS", roles: [{ role: "readWrite", db: "$DB_NAME" }] });

load("/docker-entrypoint-initdb.d/data-hotels.txt");
load("/docker-entrypoint-initdb.d/data-reservations.txt");
EOF

# stop temporal process
mongod --port "$DB_PORT" --replSet "$REPLICA" --shutdown