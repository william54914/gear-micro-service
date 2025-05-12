-- Drop the users table if it exists
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  date_of_birth DATE,
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  role VARCHAR(255) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user (password 'isgay' hashed with bcrypt)
-- Note: You'll need to replace this with the actual bcrypt hash in your application
INSERT INTO users (
  username, 
  password_hash, 
  first_name, 
  last_name, 
  date_of_birth, 
  email, 
  is_active, 
  role
) VALUES (
  'will',
  '$2b$10$zKDZ0HuK3kYDxlnDv6TlquQQpCe/XD0M3k/2yL3MQjcbTM.CJWh6S', -- bcrypt hash for 'isgay'
  'Will',
  'Larson',
  '1987-08-17',
  'will@example.com',
  TRUE,
  'admin'
); 