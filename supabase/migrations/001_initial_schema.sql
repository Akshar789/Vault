-- =============================================================================
-- ZERO-KNOWLEDGE VAULT - INITIAL SCHEMA
-- =============================================================================
-- SECURITY PRINCIPLES:
-- 1. All sensitive data stored as encrypted blobs (bytea)
-- 2. Server NEVER has decryption keys
-- 3. UUIDs for all sensitive records (no sequential IDs)
-- 4. Audit logs contain NO sensitive data
-- 5. Indexes avoid sensitive columns
-- 6. Row-level security DISABLED for encrypted blobs (server is untrusted)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Authentication: PBKDF2 hash of master password (for auth ONLY, NOT encryption)
    -- SECURITY: This is bcrypt(PBKDF2(master_password))
    -- Server cannot derive encryption keys from this
    master_password_hash VARCHAR(255) NOT NULL,
    
    -- KDF parameters for client-side Argon2id key derivation
    kdf_algorithm VARCHAR(50) NOT NULL DEFAULT 'Argon2id',
    kdf_memory INTEGER NOT NULL, -- Memory cost in KB
    kdf_iterations INTEGER NOT NULL, -- Time cost
    kdf_parallelism INTEGER NOT NULL, -- Parallelism factor
    kdf_salt_length INTEGER NOT NULL DEFAULT 16,
    kdf_hash_length INTEGER NOT NULL DEFAULT 32,
    kdf_salt TEXT NOT NULL, -- Base64-encoded salt
    
    -- User's RSA key pair (private key encrypted with master key)
    -- SECURITY: Server cannot decrypt private key
    encrypted_private_key BYTEA NOT NULL,
    encrypted_private_key_iv TEXT NOT NULL,
    encrypted_private_key_tag TEXT NOT NULL,
    public_key TEXT NOT NULL, -- PEM format, not sensitive
    
    -- User's symmetric vault encryption key (encrypted with master key)
    -- SECURITY: Server cannot decrypt this
    encrypted_symmetric_key BYTEA NOT NULL,
    encrypted_symmetric_key_iv TEXT NOT NULL,
    encrypted_symmetric_key_tag TEXT NOT NULL,
    
    -- Key version for algorithm agility
    key_version INTEGER NOT NULL DEFAULT 1,
    
    -- 2FA
    two_factor_secret TEXT, -- Encrypted TOTP secret
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_backup_codes TEXT[], -- Encrypted backup codes
    
    -- Security
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT kdf_memory_range CHECK (kdf_memory >= 1024 AND kdf_memory <= 1048576),
    CONSTRAINT kdf_iterations_range CHECK (kdf_iterations >= 1 AND kdf_iterations <= 100),
    CONSTRAINT kdf_parallelism_range CHECK (kdf_parallelism >= 1 AND kdf_parallelism <= 64)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_locked_until ON users(locked_until) WHERE locked_until IS NOT NULL;

-- =============================================================================
-- DEVICE SESSIONS TABLE
-- =============================================================================
-- SECURITY: Device-bound sessions for better security
-- Each device has separate refresh token
CREATE TABLE device_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Refresh token (hashed with bcrypt)
    -- SECURITY: Token itself is random UUID, stored hashed
    refresh_token_hash TEXT NOT NULL UNIQUE,
    
    -- Token family for reuse detection
    -- SECURITY: If token from revoked family is used, all sessions revoked
    token_family UUID NOT NULL DEFAULT uuid_generate_v4(),
    token_sequence INTEGER NOT NULL DEFAULT 1,
    
    -- Device information
    device_name VARCHAR(100),
    device_type VARCHAR(20),
    device_fingerprint TEXT,
    
    -- Network information
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Revocation
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason TEXT
);

-- Indexes
CREATE INDEX idx_device_sessions_user_id ON device_sessions(user_id);
CREATE INDEX idx_device_sessions_token_hash ON device_sessions(refresh_token_hash);
CREATE INDEX idx_device_sessions_token_family ON device_sessions(token_family);
CREATE INDEX idx_device_sessions_expires_at ON device_sessions(expires_at);
CREATE INDEX idx_device_sessions_revoked ON device_sessions(revoked) WHERE revoked = FALSE;

-- =============================================================================
-- ORGANIZATIONS TABLE
-- =============================================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Creator
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    -- Key version
    key_version INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_organizations_created_by ON organizations(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_name ON organizations(name) WHERE deleted_at IS NULL;

-- =============================================================================
-- COLLECTIONS TABLE
-- =============================================================================
-- Collections are folders within organizations
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(organization_id, name)
);

-- Indexes
CREATE INDEX idx_collections_org_id ON collections(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_collections_name ON collections(organization_id, name) WHERE deleted_at IS NULL;

-- =============================================================================
-- VAULT ITEMS TABLE
-- =============================================================================
-- SECURITY: All sensitive data encrypted client-side
-- Server stores ONLY encrypted blobs
CREATE TABLE vault_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    
    -- Type (not sensitive)
    type VARCHAR(50) NOT NULL,
    
    -- ENCRYPTED DATA (server CANNOT decrypt)
    -- Contains: name, username, password, notes, etc.
    encrypted_data BYTEA NOT NULL,
    encrypted_data_iv TEXT NOT NULL,
    encrypted_data_tag TEXT NOT NULL, -- GCM authentication tag
    
    -- Key version for rotation
    key_version INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata (not sensitive)
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_at TIMESTAMP WITH TIME ZONE,
    
    -- Soft delete for recovery
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_type CHECK (type IN ('login', 'secure_note', 'api_key', 'card'))
);

-- Indexes
CREATE INDEX idx_vault_items_user_id ON vault_items(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vault_items_org_id ON vault_items(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vault_items_collection_id ON vault_items(collection_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vault_items_type ON vault_items(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_vault_items_favorite ON vault_items(user_id, favorite) WHERE favorite = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_vault_items_deleted_at ON vault_items(deleted_at) WHERE deleted_at IS NOT NULL;

-- =============================================================================
-- ORGANIZATION MEMBERS TABLE
-- =============================================================================
-- SECURITY: Organization key encrypted per-member with their public key
-- Removing member = delete their encrypted key copy = instant revocation
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role-based access control
    role VARCHAR(20) NOT NULL,
    
    -- Organization's symmetric key encrypted with member's public key
    -- SECURITY: Server cannot decrypt this
    -- Each member has their own encrypted copy
    encrypted_org_key BYTEA NOT NULL,
    encrypted_org_key_iv TEXT NOT NULL,
    encrypted_org_key_tag TEXT NOT NULL,
    
    -- Key version
    key_version INTEGER NOT NULL DEFAULT 1,
    
    -- Metadata
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(organization_id, user_id),
    CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'member', 'read_only'))
);

-- Indexes
CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(organization_id, role);

-- =============================================================================
-- AUDIT LOGS TABLE
-- =============================================================================
-- SECURITY CRITICAL: NO SENSITIVE DATA IN LOGS
-- - No passwords
-- - No encryption keys
-- - No plaintext vault data
-- - Only metadata for compliance and security monitoring
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255), -- Denormalized for retention after user deletion
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- What
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    
    -- Result
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    
    -- Context (no sensitive data)
    ip_address INET,
    user_agent TEXT,
    device_id UUID,
    
    -- Metadata (sanitized, no sensitive data)
    metadata JSONB,
    
    -- When
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_org_id ON audit_logs(organization_id, timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, timestamp DESC);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id, timestamp DESC);

-- =============================================================================
-- REVOKED TOKENS TABLE
-- =============================================================================
-- For token revocation before expiry
-- Redis is primary store, this is backup
CREATE TABLE revoked_tokens (
    jti UUID PRIMARY KEY, -- JWT ID
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT
);

-- Indexes
CREATE INDEX idx_revoked_tokens_user_id ON revoked_tokens(user_id);
CREATE INDEX idx_revoked_tokens_expires_at ON revoked_tokens(expires_at);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_items_updated_at
    BEFORE UPDATE ON vault_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SECURITY POLICIES
-- =============================================================================
-- NOTE: Row-level security is DISABLED for encrypted data
-- Server is treated as untrusted storage
-- Access control enforced in application layer

-- Enable RLS on audit logs (read-only for users)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_user_read ON audit_logs
    FOR SELECT
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID);

-- =============================================================================
-- CLEANUP FUNCTIONS
-- =============================================================================

-- Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM device_sessions
    WHERE expires_at < NOW() OR revoked = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired revoked tokens
CREATE OR REPLACE FUNCTION cleanup_expired_revoked_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM revoked_tokens
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Clean up old audit logs (optional, for GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs
    WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS (Documentation)
-- =============================================================================

COMMENT ON TABLE users IS 'User accounts. All sensitive keys are encrypted client-side.';
COMMENT ON COLUMN users.master_password_hash IS 'bcrypt(PBKDF2(master_password)). Used for auth only, NOT encryption.';
COMMENT ON COLUMN users.encrypted_private_key IS 'RSA private key encrypted with master key. Server cannot decrypt.';
COMMENT ON COLUMN users.encrypted_symmetric_key IS 'Vault encryption key encrypted with master key. Server cannot decrypt.';

COMMENT ON TABLE vault_items IS 'Encrypted vault items. Server stores only encrypted blobs.';
COMMENT ON COLUMN vault_items.encrypted_data IS 'All sensitive data encrypted client-side. Server CANNOT decrypt.';

COMMENT ON TABLE organization_members IS 'Organization membership. Each member has encrypted copy of org key.';
COMMENT ON COLUMN organization_members.encrypted_org_key IS 'Org key encrypted with member public key. Deletion = instant revocation.';

COMMENT ON TABLE audit_logs IS 'Audit trail. NO SENSITIVE DATA. Metadata only.';

COMMENT ON TABLE device_sessions IS 'Device-bound sessions with refresh token rotation and reuse detection.';
COMMENT ON COLUMN device_sessions.token_family IS 'Token family for reuse detection. If reused, all family tokens revoked.';
