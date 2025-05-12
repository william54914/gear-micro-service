-- Count the number of records in each table
SELECT 'amazon_vitals' AS table_name, COUNT(*) AS record_count FROM amazon_vitals
UNION ALL
SELECT 'amazon_info', COUNT(*) FROM amazon_info
UNION ALL
SELECT 'amazon_price', COUNT(*) FROM amazon_price
UNION ALL
SELECT 'amazon_quantity', COUNT(*) FROM amazon_quantity
UNION ALL
SELECT 'amazon_zshop', COUNT(*) FROM amazon_zshop;

-- View sample data from amazon_vitals (first 10 records)
SELECT * FROM amazon_vitals LIMIT 10;

-- View sample data with joined information (first 10 records)
SELECT 
    v.id,
    v.seller_sku,
    v.item_name,
    v.asin,
    v.status,
    i.item_description,
    p.price,
    q.quantity,
    z.zshop_shipping_fee
FROM amazon_vitals v
LEFT JOIN amazon_info i ON v.seller_sku = i.seller_sku
LEFT JOIN amazon_price p ON v.seller_sku = p.seller_sku
LEFT JOIN amazon_quantity q ON v.seller_sku = q.seller_sku
LEFT JOIN amazon_zshop z ON v.seller_sku = z.seller_sku
LIMIT 10; 