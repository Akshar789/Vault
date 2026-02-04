-- =============================================================================
-- CLEANUP SCRIPT - Run this FIRST if you need to start fresh
-- =============================================================================
-- WARNING: This will delete ALL data and tables!
-- Only run this if you want to completely reset the database
-- =============================================================================

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS revoked_tokens CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS vault_items CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS device_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_sessions() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_revoked_tokens() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_audit_logs(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS set_partition_date() CASCADE;

-- Verify cleanup
SELECT 'Cleanup complete! All tables dropped.' as status;

-- Show remaining tables (should be empty or only system tables)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
