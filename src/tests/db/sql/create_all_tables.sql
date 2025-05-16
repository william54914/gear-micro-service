-- Create all database tables in the correct order

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    vendor_id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(100) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
    brand_id SERIAL PRIMARY KEY,
    brand_name VARCHAR(100) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand_id INTEGER REFERENCES brands(brand_id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendor_products table
CREATE TABLE IF NOT EXISTS vendor_products (
    vendor_product_id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(vendor_id),
    product_id INTEGER REFERENCES products(product_id),
    vendor_sku VARCHAR(100) NOT NULL,
    vendor_product_name VARCHAR(255),
    vendor_product_description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vendor_id, vendor_sku)
);

-- Create vendor_inventory table
CREATE TABLE IF NOT EXISTS vendor_inventory (
    inventory_id SERIAL PRIMARY KEY,
    vendor_product_id INTEGER REFERENCES vendor_products(vendor_product_id),
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendor_pricing table
CREATE TABLE IF NOT EXISTS vendor_pricing (
    pricing_id SERIAL PRIMARY KEY,
    vendor_product_id INTEGER REFERENCES vendor_products(vendor_product_id),
    cost_price DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    map_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendor_attributes table
CREATE TABLE IF NOT EXISTS vendor_attributes (
    attribute_id SERIAL PRIMARY KEY,
    vendor_product_id INTEGER REFERENCES vendor_products(vendor_product_id),
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendor_images table
CREATE TABLE IF NOT EXISTS vendor_images (
    image_id SERIAL PRIMARY KEY,
    vendor_product_id INTEGER REFERENCES vendor_products(vendor_product_id),
    image_url TEXT NOT NULL,
    image_type VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendor_dimensions table
CREATE TABLE IF NOT EXISTS vendor_dimensions (
    dimension_id SERIAL PRIMARY KEY,
    vendor_product_id INTEGER REFERENCES vendor_products(vendor_product_id),
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    weight DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendor_distributor_info table
CREATE TABLE IF NOT EXISTS vendor_distributor_info (
    distributor_info_id SERIAL PRIMARY KEY,
    vendor_product_id INTEGER REFERENCES vendor_products(vendor_product_id),
    distributor_id VARCHAR(100),
    distributor_category VARCHAR(100),
    distributor_subcategory VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    permission_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    role_id INTEGER REFERENCES user_roles(role_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
); 