-- =============================================================================
-- SAFE MIGRATION - Creates tables only if they don't exist
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    master_password_hash VARCHAR(255) NOT NULL,
    kdf_algorithm VARCHAR(50) NOT NULL DEFAULT 'Argon2id',
    kdf_memory INTEGER NOT NULL,
    kdf_iterations INTEGER NOT NULL,
    kdf_parallelism INTEGER NOT NULL,
    kdf_salt_length INTEGER NOT NULL DEFAULT 16,
    kdf_hash_length INTEGER NOT NULL DEFAULT 32,
    kdf_salt TEXT NOT NULL,
    encrypted_private_key BYTEA NOT NULL,
    encrypted_private_key_iv TEXT NOT NULL,
    encrypted_private_key_tag TEXT NOT NULL,
    public_key TEXT NOT NULL,
    encrypted_symmetric_key BYTEA NOT NULL,
    encrypted_symmetric_key_iv TEXT NOT NULL,
    encrypted_symmetric_key_tag TEXT NOT NULL,
    key_version INTEGER NOT NULL DEFAULT 1,
    two_factor_secret TEXT,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_backup_codes TEXT[],
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT kdf_memory_range CHECK (kdf_memory >= 1024 AND kdf_memory <= 1048576),
    CONSTRAINT kdf_iterations_range CHECK (kdf_iterations >= 1 AND kdf_iterations <= 100),
    CONSTRAINT kdf_parallelism_range CHECK (kdf_parallelism >= 1 AND kdf_parallelism <= 64)
);

-- Continue with remaining tables...
-- (This is a safe version that won't fail if tables exist)

SELECT 'Migration completed! Check table editor to verify.' as status;
