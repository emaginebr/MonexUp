#!/bin/bash
set -e

# Create the NAuth database (monexup is created automatically via POSTGRES_DB)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE nauth_db;
    GRANT ALL PRIVILEGES ON DATABASE nauth_db TO $POSTGRES_USER;
EOSQL

# Apply NAuth schema on nauth_db if available
if [ -f /docker-entrypoint-initdb.d/nauth-schema.sql ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "nauth_db" \
        -f /docker-entrypoint-initdb.d/nauth-schema.sql
fi
