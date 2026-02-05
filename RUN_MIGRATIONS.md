# 🔧 Fix 500 Error - Run Database Migrations

## The Problem

Your backend is getting a 500 error because the database tables don't exist yet in Supabase. We need to create them!

---

## ✅ Solution: Run Migrations in Supabase

### Step 1: Go to Supabase SQL Editor

1. Go to: **https://supabase.com/dashboard**
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Copy and Run This SQL

Copy this entire SQL script and paste it into the SQL editor:

```sql
-- =============================================================================
-- ZERO-KNOWLEDGE VAULT - DATABASE SCHEMA
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    auth_hash VARCHAR(255) NOT NULL,
    salt TEXT NOT NULL,
    encrypted_private_key TEXT,
    public_key TEXT,
    two_factor_secret TEXT,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- =============================================================================
-- VAULT ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS vault_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    encrypted_data TEXT NOT NULL,
    iv TEXT NOT NULL,
    favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_type CHECK (type IN ('login', 'note', 'card'))
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_vault_items_user_id ON vault_items(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_items_type ON vault_items(type);
CREATE INDEX IF NOT EXISTS idx_vault_items_favorite ON vault_items(favorite);

-- =============================================================================
-- REFRESH TOKENS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info TEXT,
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- =============================================================================
-- AUDIT LOGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vault_items_updated_at ON vault_items;
CREATE TRIGGER update_vault_items_updated_at
    BEFORE UPDATE ON vault_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Vault items policies
CREATE POLICY vault_items_select_own ON vault_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY vault_items_insert_own ON vault_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY vault_items_update_own ON vault_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY vault_items_delete_own ON vault_items
    FOR DELETE USING (auth.uid() = user_id);

-- Refresh tokens policies
CREATE POLICY refresh_tokens_select_own ON refresh_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY refresh_tokens_insert_own ON refresh_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY refresh_tokens_delete_own ON refresh_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Audit logs policies (read-only for users)
CREATE POLICY audit_logs_select_own ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- VERIFICATION
-- =============================================================================

SELECT 'Migration completed successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'vault_items', 'refresh_tokens', 'audit_logs');
```

### Step 3: Run the Query

1. Click **"Run"** button (or press Ctrl+Enter)
2. You should see: "Migration completed successfully!"
3. You should see all 4 tables listed

### Step 4: Verify Tables Were Created

1. Go to **"Table Editor"** in Supabase
2. You should see these tables:
   - ✅ users
   - ✅ vault_items
   - ✅ refresh_tokens
   - ✅ audit_logs

---

## ✅ Test Your App Again

Now try creating an account again:

1. Go to: **https://vault-vert-eight.vercel.app/register**
2. Enter email and password
3. Click "Create Account"
4. **It should work now!** ✅

### Verify in Supabase

1. Go to **Table Editor** → **users** table
2. You should see your new user!
3. Go to **vault_items** table
4. Add a password in your app
5. You should see it appear here (encrypted)!

---

## 🆘 If It Still Fails

Check Railway logs:

1. Go to Railway dashboard
2. Click on your backend service
3. Go to **"Deployments"** tab
4. Click on the latest deployment
5. Look at the logs for any errors

Common issues:

**"relation 'users' does not exist"**
- The migration didn't run
- Run the SQL script again in Supabase

**"permission denied"**
- RLS policies might be too strict
- Temporarily disable RLS for testing

**"connection refused"**
- Check DATABASE_URL environment variable in Railway
- Make sure it matches your Supabase connection string

---

## 🎉 Success!

Once the migration runs, your app will be fully functional:
- ✅ Create accounts
- ✅ Login/logout
- ✅ Add passwords
- ✅ Edit passwords
- ✅ Delete passwords
- ✅ Search and favorites
- ✅ All data encrypted in Supabase!

---

**Run the SQL migration in Supabase and your app will work!** 🚀
