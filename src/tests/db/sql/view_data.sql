-- View data from all tables in a structured way

-- View vendors
SELECT 'Vendors' as table_name, COUNT(*) as total_count, 
       COUNT(*) FILTER (WHERE active = true) as active_count 
FROM vendors;

-- View brands
SELECT 'Brands' as table_name, COUNT(*) as total_count, 
       COUNT(*) FILTER (WHERE active = true) as active_count 
FROM brands;

-- View products
SELECT 'Products' as table_name, COUNT(*) as total_count, 
       COUNT(*) FILTER (WHERE active = true) as active_count 
FROM products;

-- View vendor products
SELECT 'Vendor Products' as table_name, COUNT(*) as total_count, 
       COUNT(*) FILTER (WHERE active = true) as active_count 
FROM vendor_products;

-- View inventory levels
SELECT 'Inventory' as table_name, COUNT(*) as total_count,
       SUM(quantity) as total_quantity
FROM vendor_inventory;

-- View pricing information
SELECT 'Pricing' as table_name, COUNT(*) as total_count,
       AVG(cost_price) as avg_cost,
       AVG(retail_price) as avg_retail,
       AVG(map_price) as avg_map
FROM vendor_pricing; 