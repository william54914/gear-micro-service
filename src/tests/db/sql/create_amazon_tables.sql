-- Create Amazon-specific tables

-- Create amazon_listings table
CREATE TABLE IF NOT EXISTS amazon_listings (
    listing_id SERIAL PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    asin VARCHAR(10) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(100),
    condition_type VARCHAR(50),
    condition_note TEXT,
    quantity INTEGER DEFAULT 0,
    price DECIMAL(10,2),
    business_price DECIMAL(10,2),
    fulfillment_channel VARCHAR(50),
    status VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create amazon_inventory table
CREATE TABLE IF NOT EXISTS amazon_inventory (
    inventory_id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES amazon_listings(listing_id),
    quantity INTEGER DEFAULT 0,
    fulfillable_quantity INTEGER DEFAULT 0,
    inbound_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create amazon_pricing table
CREATE TABLE IF NOT EXISTS amazon_pricing (
    pricing_id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES amazon_listings(listing_id),
    regular_price DECIMAL(10,2),
    business_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    sale_start_date TIMESTAMP,
    sale_end_date TIMESTAMP,
    minimum_price DECIMAL(10,2),
    maximum_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create amazon_fees table
CREATE TABLE IF NOT EXISTS amazon_fees (
    fee_id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES amazon_listings(listing_id),
    referral_fee_percent DECIMAL(5,2),
    per_item_fee DECIMAL(10,2),
    fba_fees DECIMAL(10,2),
    other_fees DECIMAL(10,2),
    total_fees DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create amazon_shipping table
CREATE TABLE IF NOT EXISTS amazon_shipping (
    shipping_id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES amazon_listings(listing_id),
    shipping_template VARCHAR(100),
    handling_time INTEGER,
    is_prime_eligible BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create amazon_categories table
CREATE TABLE IF NOT EXISTS amazon_categories (
    category_id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES amazon_listings(listing_id),
    browse_path VARCHAR(255),
    category_name VARCHAR(100),
    subcategory_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create amazon_dimensions table
CREATE TABLE IF NOT EXISTS amazon_dimensions (
    dimension_id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES amazon_listings(listing_id),
    package_length DECIMAL(10,2),
    package_width DECIMAL(10,2),
    package_height DECIMAL(10,2),
    package_weight DECIMAL(10,2),
    item_length DECIMAL(10,2),
    item_width DECIMAL(10,2),
    item_height DECIMAL(10,2),
    item_weight DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 