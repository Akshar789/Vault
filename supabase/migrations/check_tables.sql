-- =============================================================================
-- CHECK EXISTING TABLES
-- =============================================================================
-- Run this to see what tables already exist in your database
-- =============================================================================

-- List all tables
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if all required tables exist
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN '✓' 
        ELSE '✗' 
    END as users,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'device_sessions') THEN '✓' 
        ELSE '✗' 
    END as device_sessions,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vault_items') THEN '✓' 
        ELSE '✗' 
    END as vault_items,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN '✓' 
        ELSE '✗' 
    END as organizations,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_members') THEN '✓' 
        ELSE '✗' 
    END as organization_members,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collections') THEN '✓' 
        ELSE '✗' 
    END as collections,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN '✓' 
        ELSE '✗' 
    END as audit_logs,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'revoked_tokens') THEN '✓' 
        ELSE '✗' 
    END as revoked_tokens;

-- Count rows in each table (if they exist)
DO $$
DECLARE
    table_record RECORD;
    row_count INTEGER;
BEGIN
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_record.table_name) INTO row_count;
        RAISE NOTICE '% has % rows', table_record.table_name, row_count;
    END LOOP;
END $$;
