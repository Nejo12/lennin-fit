-- Add phone column to clients table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = 'phone'
    ) THEN
        ALTER TABLE clients ADD COLUMN phone text;
    END IF;
END $$;
