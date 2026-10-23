-- Initial Schema for Go Kart Warehouse

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    bio TEXT,
    profile_picture BYTEA,
    profile_picture_type VARCHAR(50),
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE karts (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    hours_run INTEGER DEFAULT 0,
    status_note VARCHAR(1000)
);

CREATE TABLE announcements (
    id BIGSERIAL PRIMARY KEY,
    message TEXT,
    author VARCHAR(255),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(255) UNIQUE NOT NULL,
    quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    restock_flag BOOLEAN DEFAULT FALSE,
    last_audited TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE maintenance (
    id BIGSERIAL PRIMARY KEY,
    kart_id BIGINT NOT NULL REFERENCES karts(id),
    description TEXT NOT NULL,
    performed_by VARCHAR(255),
    performed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    priority BOOLEAN DEFAULT FALSE
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(255),
    data BYTEA,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incident (
    id BIGSERIAL PRIMARY KEY,
    reported_by_id BIGINT REFERENCES users(id),
    kart_id BIGINT REFERENCES karts(id),
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    severity VARCHAR(50) DEFAULT 'MEDIUM',
    corrective_action TEXT,
    resolution TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE task (
    id BIGSERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    assignee_id BIGINT REFERENCES users(id),
    creator_id BIGINT REFERENCES users(id),
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    due_date TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_schedule (
    id BIGSERIAL PRIMARY KEY,
    kart_id BIGINT REFERENCES karts(id),
    description TEXT NOT NULL,
    interval_days INTEGER NOT NULL,
    last_performed TIMESTAMP WITHOUT TIME ZONE,
    next_due TIMESTAMP WITHOUT TIME ZONE,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE part_request (
    id BIGSERIAL PRIMARY KEY,
    part_id BIGINT REFERENCES parts(id),
    requester_id BIGINT REFERENCES users(id),
    quantity INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    requested_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    expiry_date TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
