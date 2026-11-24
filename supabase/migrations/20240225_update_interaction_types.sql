-- Note: This migration is not needed as the database already uses English types
-- The code has been updated to match the database schema
-- Database types: 'call', 'email', 'meeting', 'note'
-- Code now uses: 'call', 'email', 'meeting', 'visit', 'note'

-- If you need to add 'visit' type to the database constraint:
-- ALTER TABLE interactions DROP CONSTRAINT IF EXISTS interactions_type_check;
-- ALTER TABLE interactions ADD CONSTRAINT interactions_type_check
-- CHECK (type IN ('call', 'email', 'meeting', 'note', 'visit'));
