-- Make owner_id nullable temporarily for demo data
ALTER TABLE farms ALTER COLUMN owner_id DROP NOT NULL;