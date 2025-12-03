CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    facebook_access_token TEXT,
    role VARCHAR(50)
);

INSERT INTO users (username, password, email, role, facebook_access_token)
SELECT 'admin', '$2b$12$iXtQpQHACdjTPtxxPmIbXO0ntqQk.nJ8izoWc1soDFPJg0SdGHgaW', 'admin@example.com', 'ADMIN', NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');