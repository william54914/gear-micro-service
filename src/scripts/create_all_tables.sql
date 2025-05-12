-- First create the users table
CREATE TABLE IF NOT EXISTS users (
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

-- Insert admin user (only if it doesn't exist)
INSERT INTO users (username, password_hash, first_name, last_name, date_of_birth, email, is_active, role)
SELECT 'will', '$2b$10$zKDZ0HuK3kYDxlnDv6TlquQQpCe/XD0M3k/2yL3MQjcbTM.CJWh6S', 'Will', 'Larson', '1987-08-17', 'will@example.com', TRUE, 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'will');

-- Create amazon_vitals table
CREATE TABLE IF NOT EXISTS amazon_vitals (
  id SERIAL PRIMARY KEY,
  seller_sku VARCHAR(255) NOT NULL UNIQUE,
  fnsku VARCHAR(255),
  item_name VARCHAR(255),
  asin VARCHAR(255),
  status VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create amazon_info table
CREATE TABLE IF NOT EXISTS amazon_info (
  id SERIAL PRIMARY KEY,
  seller_sku VARCHAR(255) NOT NULL UNIQUE,
  listing_id VARCHAR(255),
  item_description TEXT,
  image_url VARCHAR(255),
  is_marketplace BOOLEAN,
  product_id_type VARCHAR(255),
  item_note TEXT,
  item_condition VARCHAR(255),
  open_date TIMESTAMP,
  asin1 VARCHAR(255),
  asin2 VARCHAR(255),
  asin3 VARCHAR(255),
  product_id VARCHAR(255),
  fulfillment_channel VARCHAR(255),
  merchant_shipping_group VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_sku) REFERENCES amazon_vitals(seller_sku) ON DELETE CASCADE
);

-- Create amazon_price table
CREATE TABLE IF NOT EXISTS amazon_price (
  id SERIAL PRIMARY KEY,
  seller_sku VARCHAR(255) NOT NULL UNIQUE,
  price DECIMAL(10, 2),
  bid_for_featured_placement VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_sku) REFERENCES amazon_vitals(seller_sku) ON DELETE CASCADE
);

-- Create amazon_quantity table
CREATE TABLE IF NOT EXISTS amazon_quantity (
  id SERIAL PRIMARY KEY,
  seller_sku VARCHAR(255) NOT NULL UNIQUE,
  quantity INTEGER,
  pending_quantity INTEGER,
  add_delete VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_sku) REFERENCES amazon_vitals(seller_sku) ON DELETE CASCADE
);

-- Create amazon_zshop table
CREATE TABLE IF NOT EXISTS amazon_zshop (
  id SERIAL PRIMARY KEY,
  seller_sku VARCHAR(255) NOT NULL UNIQUE,
  zshop_shipping_fee VARCHAR(255),
  zshop_category1 VARCHAR(255),
  zshop_browse_path VARCHAR(255),
  zshop_storefront_feature VARCHAR(255),
  zshop_boldface VARCHAR(255),
  will_ship_internationally VARCHAR(255),
  expedited_shipping VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_sku) REFERENCES amazon_vitals(seller_sku) ON DELETE CASCADE
); 