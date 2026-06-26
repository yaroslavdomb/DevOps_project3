FROM mongo:8
COPY mongo-init/ /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init-replica.sh
ENTRYPOINT []
CMD ["sh", "-c", "/docker-entrypoint-initdb.d/init-replica.sh && exec mongod --replSet $REPLICA --port $DB_PORT --bind_ip_all"]