-- Check the structure of amazon_listings table
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'amazon_listings'
ORDER BY ordinal_position;

-- Check the structure of amazon_zshop_details table
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'amazon_zshop_details'
ORDER BY ordinal_position;

-- Check the structure of amazon_item_images table
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'amazon_item_images'
ORDER BY ordinal_position; 