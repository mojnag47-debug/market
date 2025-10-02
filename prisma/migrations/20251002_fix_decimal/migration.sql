-- Add unique constraint for ARAsset to ensure only one asset per product per fileType
ALTER TABLE IF EXISTS "ar_assets"
ADD CONSTRAINT ar_assets_productid_filetype_unique UNIQUE ("productId", "fileType");
