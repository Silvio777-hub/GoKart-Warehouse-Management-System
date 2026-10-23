-- Create Database
DROP DATABASE IF EXISTS swam_db;
CREATE DATABASE swam_db;

-- Create User (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'swam') THEN
        CREATE USER swam WITH PASSWORD 'swam_pass';
    END IF;
END
$$;

-- Grant Privileges
GRANT ALL PRIVILEGES ON DATABASE swam_db TO swam;
ALTER DATABASE swam_db OWNER TO swam;
