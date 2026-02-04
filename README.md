# Zero-Knowledge Team Password Vault
## Production-Ready | Fly.io + Supabase Architecture

A production-grade, zero-knowledge password vault with enterprise security, designed for horizontal scaling on Fly.io with Supabase PostgreSQL.

## 🔒 Security Architecture

### Zero-Knowledge Guarantee
- **Server NEVER sees plaintext**: All encryption/decryption client-side only
- **Assume full compromise**: System secure even if server, database, and logs are leaked
- **No trust model**: Server is treated as untrusted storage

### Cryptography Stack
- **Argon2id**: Memory-hard key derivation (tunable parameters)
- **AES-256-GCM**: Authenticated encryption for vault items
- **RSA-OAEP-256**: Asymmetric encryption for sharing (4096-bit keys)
- **Web Crypto API**: Browser-native, hardware-accelerated
- **Constant-time operations**: Timing attack resistant

### Key Hierarchy
```
Master Password (never stored, never transmitted)
    ↓ Argon2id (client-side)
Master Key (256-bit, memory only)
    ↓ derives
    ├─ Vault Encryption Key (AES-256)
    ├─ Auth Key (PBKDF2, server auth only)
    └─ MAC Key (data authentication)

User RSA Key Pair (4096-bit)
    ├─ Public Key (server storage, not sensitive)
    └─ Private Key (encrypted with Master Key)

Organization Keys (per-org)
    └─ Symmetric Key (encrypted per-member with RSA)
```

## 🏗️ Infrastructure

### Fly.io Backend
- Stateless NestJS API servers
- Horizontal auto-scaling
- Multi-region deployment ready
- TLS 1.3 enforced
- Health checks & graceful shutdown

### Supabase PostgreSQL
- Encrypted at rest
- SSL connections required
- Row-level security (RLS) disabled for encrypted blobs
- UUID primary keys
- Forward-compatible schema

### Upstash Redis
- TLS connections
- Rate limiting
- Token revocation lists
- Device session metadata
- NO decrypted secrets

## 🚀 Quick Start

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup instructions.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit with your Supabase and Upstash credentials

# 3. Run migrations
npm run migrate

# 4. Start development
npm run dev

# 5. Deploy to Fly.io
fly deploy
```

## 📁 Project Structure

```
/
├── apps/
│   ├── backend/          # NestJS API (Fly.io)
│   │   ├── src/
│   │   │   ├── auth/     # Authentication & sessions
│   │   │   ├── vault/    # Vault item management
│   │   │   ├── org/      # Organizations & sharing
│   │   │   ├── audit/    # Audit logging
│   │   │   └── crypto/   # Server-side crypto utilities
│   │   ├── Dockerfile
│   │   └── fly.toml
│   └── frontend/         # Next.js client
│       ├── src/
│       │   ├── lib/
│       │   │   ├── crypto/      # Client-side encryption
│       │   │   ├── vault/       # Vault management
│       │   │   └── api/         # API client
│       │   ├── app/             # Next.js 14 app router
│       │   └── components/
│       └── Dockerfile
├── packages/
│   └── shared/           # Shared types & utilities
├── supabase/
│   └── migrations/       # Database migrations
└── docs/
    ├── SECURITY.md       # Security architecture
    ├── DEPLOYMENT.md     # Deployment guide
    └── API.md           # API documentation
```

## 🔐 Security Features

- ✅ Zero-knowledge architecture
- ✅ Client-side encryption only
- ✅ Argon2id key derivation (tunable)
- ✅ AES-256-GCM authenticated encryption
- ✅ RSA-OAEP for secure sharing
- ✅ JWT + refresh token rotation
- ✅ Refresh token reuse detection
- ✅ Device-bound sessions
- ✅ TOTP 2FA support
- ✅ Rate limiting & brute-force protection
- ✅ Account lockout
- ✅ Audit logging (no sensitive data)
- ✅ Instant access revocation
- ✅ Role-based access control
- ✅ Key versioning support
- ✅ Secure password change flow
- ✅ XSS/CSRF/clickjacking protection
- ✅ Strict CSP headers
- ✅ Secure clipboard handling
- ✅ Encrypted offline cache (IndexedDB)

## 📊 Compliance

- **GDPR**: Data minimization, right to erasure, privacy by design
- **SOC 2**: Access controls, audit trails, encryption
- **HIPAA**: Encryption, access controls, audit logs

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# E2E tests
npm run test:e2e

# Security tests
npm run test:security
```

## 📚 Documentation

- [Security Architecture](./docs/SECURITY.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [API Documentation](./docs/API.md)
- [Development Guide](./docs/DEVELOPMENT.md)

## 🛡️ Threat Model

### In Scope
- Full server compromise
- Database breach
- Log inspection
- Network eavesdropping
- Brute force attacks
- Insider threats
- Timing attacks

### Mitigations
- Zero-knowledge architecture
- Client-side encryption only
- Argon2id (memory-hard)
- Constant-time comparisons
- Rate limiting
- Audit logging
- Instant revocation

## 📝 License

MIT

## 🔒 Security Disclosure

**DO NOT** open public issues for security vulnerabilities.

Email: security@example.com
