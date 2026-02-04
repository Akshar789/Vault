# Security Architecture - Zero-Knowledge Vault

## Executive Summary

This vault implements **true zero-knowledge architecture** where the server is treated as **untrusted storage**. The system is designed to remain secure even if:
- ✅ Server is fully compromised
- ✅ Database is leaked
- ✅ Logs are inspected
- ✅ Backups are stolen
- ✅ Insider has full access

## Zero-Knowledge Guarantee

### What Server NEVER Sees
1. **Master passwords** - Never transmitted, never stored
2. **Encryption keys** - All keys encrypted client-side
3. **Plaintext vault data** - Only encrypted blobs stored
4. **Decrypted credentials** - Server has no decryption capability

### What Server CANNOT Do
1. **Cannot decrypt vault items** - No access to encryption keys
2. **Cannot derive encryption keys** - Auth hash uses different KDF
3. **Cannot impersonate users** - Requires master password
4. **Cannot access shared data** - Organization keys encrypted per-user

## Cryptographic Architecture

### Key Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ Master Password (user input, NEVER stored, NEVER transmitted)│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Argon2id KDF       │
              │   (client-side only) │
              │                      │
              │ • Memory: 64 MB      │
              │ • Iterations: 3      │
              │ • Parallelism: 4     │
              │ • Output: 256-bit    │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Master Key         │
              │   (256-bit, memory)  │
              │   NEVER stored       │
              └──────────┬───────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌──────────┐ ┌──────────────┐
│ Vault Enc Key  │ │ Auth Key │ │  MAC Key     │
│ (AES-256)      │ │(PBKDF2)  │ │ (HMAC-SHA256)│
│ Encrypts items │ │Server    │ │ Authenticates│
│                │ │auth only │ │ data         │
└────────────────┘ └──────────┘ └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│ User RSA Key Pair (4096-bit)                                │
│                                                              │
│ ┌──────────────────┐         ┌──────────────────┐          │
│ │  Private Key     │         │   Public Key     │          │
│ │  (encrypted with │         │   (stored on     │          │
│ │   Master Key)    │         │    server)       │          │
│ └──────────────────┘         └──────────────────┘          │
│                                                              │
│ Used for: Secure sharing, organization key distribution     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Organization Keys (per-organization)                         │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ Organization Symmetric Key (256-bit AES)                 ││
│ │ • Encrypts all items in organization                     ││
│ │ • Encrypted separately for each member                   ││
│ │ • Each member's copy encrypted with their public key     ││
│ │ • Removing member = delete their encrypted copy          ││
│ │ • Instant access revocation                              ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Cryptographic Algorithms

#### 1. Key Derivation: Argon2id
```
Purpose: Derive master key from password
Algorithm: Argon2id (memory-hard, GPU-resistant)
Parameters:
  - Memory: 65536 KB (64 MB) - configurable
  - Iterations: 3 - configurable
  - Parallelism: 4 - configurable
  - Salt: 128-bit random
  - Output: 256-bit key

Why Argon2id:
  ✓ Winner of Password Hashing Competition
  ✓ Memory-hard (resists GPU/ASIC attacks)
  ✓ Configurable parameters (future-proof)
  ✓ Side-channel resistant
  ✓ Recommended by OWASP
```

#### 2. Symmetric Encryption: AES-256-GCM
```
Purpose: Encrypt vault items
Algorithm: AES-256-GCM
Key Size: 256-bit
IV: 96-bit random (unique per encryption)
Tag: 128-bit authentication tag

Why AES-256-GCM:
  ✓ NIST approved
  ✓ Authenticated encryption (prevents tampering)
  ✓ Hardware accelerated (fast)
  ✓ Quantum-resistant (for now)
  ✓ No padding oracle attacks
```

#### 3. Asymmetric Encryption: RSA-OAEP-256
```
Purpose: Secure key sharing
Algorithm: RSA-OAEP with SHA-256
Key Size: 4096-bit
Padding: OAEP with SHA-256

Why RSA-OAEP-256:
  ✓ Secure key exchange
  ✓ No shared secrets needed
  ✓ 4096-bit keys (future-proof)
  ✓ OAEP padding (prevents attacks)
  ✓ Web Crypto API support
```

#### 4. Authentication KDF: PBKDF2-SHA256
```
Purpose: Server authentication ONLY (not encryption)
Algorithm: PBKDF2 with SHA-256
Iterations: 100,000
Salt: email + constant
Output: 256-bit hash

Why separate from encryption:
  ✓ Server cannot derive encryption keys
  ✓ Different algorithm (Argon2id vs PBKDF2)
  ✓ Different salt
  ✓ Even if auth hash leaked, encryption safe
```

## Security Workflows

### 1. User Registration

```
CLIENT SIDE:
1. User enters: email + master password
2. Generate random salt (128-bit)
3. Derive master key: Argon2id(password, salt, 64MB, 3 iter)
4. Generate RSA key pair (4096-bit)
5. Generate symmetric key (256-bit AES)
6. Encrypt private key with master key (AES-256-GCM)
7. Encrypt symmetric key with master key (AES-256-GCM)
8. Derive auth hash: PBKDF2(password + email, 100k iter)
9. Send to server:
   ✓ Email
   ✓ Auth hash (for authentication only)
   ✓ Encrypted private key
   ✓ Public key
   ✓ Encrypted symmetric key
   ✓ KDF parameters
   ✗ Master password (NEVER sent)
   ✗ Master key (NEVER sent)

SERVER SIDE:
1. Validate input
2. Hash auth hash with bcrypt (double hashing)
3. Store in database:
   - Email
   - bcrypt(auth_hash)
   - Encrypted keys (cannot decrypt)
   - Public key
   - KDF parameters
4. Server NEVER sees: master password, master key, plaintext keys
```

### 2. User Login

```
CLIENT SIDE:
1. User enters: email + master password
2. Fetch KDF parameters from server
3. Derive master key: Argon2id(password, salt, params)
4. Derive auth hash: PBKDF2(password + email)
5. Send auth hash to server

SERVER SIDE:
1. Verify bcrypt(auth_hash) matches stored hash
2. Check 2FA if enabled
3. Check account not locked
4. Generate JWT access token (15 min)
5. Generate refresh token (7 days, random UUID)
6. Hash refresh token with bcrypt
7. Store session in database
8. Return: tokens + encrypted keys

CLIENT SIDE:
1. Receive encrypted keys
2. Decrypt private key with master key
3. Decrypt symmetric key with master key
4. Store keys in memory (NOT localStorage)
5. Vault is now unlocked
```

### 3. Creating Vault Item

```
CLIENT SIDE:
1. User enters credentials
2. Create JSON object with data
3. Generate random IV (96-bit)
4. Encrypt with symmetric key: AES-256-GCM(data, key, IV)
5. Send to server:
   ✓ Type (not sensitive)
   ✓ Encrypted blob
   ✓ IV
   ✓ Authentication tag
   ✗ Plaintext data (NEVER sent)

SERVER SIDE:
1. Verify user authentication
2. Validate input
3. Store encrypted blob in database
4. Server NEVER sees plaintext data
5. Log access (no sensitive data in logs)
```

### 4. Secure Sharing (Organizations)

```
CREATING ORGANIZATION:
CLIENT SIDE (Creator):
1. Generate new symmetric key for organization (256-bit AES)
2. Encrypt org key with creator's public key (RSA-OAEP)
3. Send to server

SERVER SIDE:
1. Create organization
2. Store encrypted org key
3. Add creator as owner

INVITING MEMBER:
CLIENT SIDE (Owner):
1. Fetch invitee's public key from server
2. Decrypt org key with own private key
3. Encrypt org key with invitee's public key (RSA-OAEP)
4. Send encrypted org key to server

SERVER SIDE:
1. Verify owner has permission
2. Store new member's encrypted org key copy
3. Member can now access org items

REMOVING MEMBER:
SERVER SIDE:
1. Delete member's encrypted org key copy
2. Member can no longer decrypt org key
3. Member loses access to org items
4. INSTANT REVOCATION - no re-encryption needed

KEY ROTATION (if member cached key):
CLIENT SIDE (Owner):
1. Generate new org key
2. Re-encrypt all org items with new key
3. Encrypt new key for remaining members
4. Send to server

SERVER SIDE:
1. Update org key for all members
2. Delete old encrypted keys
```

### 5. Password Change (Zero-Knowledge Safe)

```
CLIENT SIDE:
1. User enters: old password + new password
2. Derive old master key: Argon2id(old_password, old_salt)
3. Decrypt private key with old master key
4. Decrypt symmetric key with old master key
5. Generate new salt
6. Derive new master key: Argon2id(new_password, new_salt)
7. Re-encrypt private key with new master key
8. Re-encrypt symmetric key with new master key
9. Derive old auth hash: PBKDF2(old_password + email)
10. Derive new auth hash: PBKDF2(new_password + email)
11. Send to server:
    ✓ Old auth hash (verification)
    ✓ New auth hash
    ✓ New encrypted private key
    ✓ New encrypted symmetric key
    ✓ New salt
    ✗ Old password (NEVER sent)
    ✗ New password (NEVER sent)

SERVER SIDE:
1. Verify old auth hash matches
2. Hash new auth hash with bcrypt
3. Update database:
   - New bcrypt(auth_hash)
   - New encrypted keys
   - New salt
4. Revoke all existing sessions (force re-login)
5. Server NEVER sees: old password, new password, master keys
```

## Attack Resistance

### 1. Brute Force Attacks

**Threat**: Attacker tries many passwords

**Mitigations**:
- ✅ Argon2id: ~100ms per attempt (memory-hard)
- ✅ 64 MB memory requirement (prevents parallel GPU attacks)
- ✅ Rate limiting: 5 attempts per 15 minutes
- ✅ Account lockout: 5 failed attempts = 15 minute lockout
- ✅ Progressive delays: Each failure increases delay
- ✅ IP-based rate limiting
- ✅ Device fingerprinting

**Result**: Brute force impractical even with leaked database

### 2. Rainbow Table Attacks

**Threat**: Pre-computed hash tables

**Mitigations**:
- ✅ Random salts: Unique 128-bit salt per user
- ✅ Stored with user: No pre-computation possible
- ✅ Argon2id: Memory-hard (tables too large)

**Result**: Rainbow tables ineffective

### 3. Timing Attacks

**Threat**: Measure response time to guess secrets

**Mitigations**:
- ✅ Constant-time comparisons: bcrypt for tokens
- ✅ No early returns: All auth paths take similar time
- ✅ Random delays: Add jitter to responses

**Result**: Timing attacks ineffective

### 4. Man-in-the-Middle (MITM)

**Threat**: Intercept network traffic

**Mitigations**:
- ✅ TLS 1.3 required: All communication encrypted
- ✅ HSTS headers: Prevents protocol downgrade
- ✅ Certificate pinning: Prevents fake certificates
- ✅ Strict CSP: Prevents injection

**Result**: MITM attacks prevented

### 5. Replay Attacks

**Threat**: Reuse captured requests

**Mitigations**:
- ✅ JWT expiry: 15-minute access tokens
- ✅ Refresh token rotation: New token on each use
- ✅ Refresh token reuse detection: Revoke family on reuse
- ✅ Random IVs: Each encryption unique
- ✅ Nonces: Prevent request replay

**Result**: Replay attacks ineffective

### 6. SQL Injection

**Threat**: Inject malicious SQL

**Mitigations**:
- ✅ Parameterized queries: All queries use parameters
- ✅ Input validation: Zod schemas
- ✅ ORM/Query builder: No raw SQL
- ✅ Least privilege: Database user has minimal permissions

**Result**: SQL injection prevented

### 7. XSS (Cross-Site Scripting)

**Threat**: Inject malicious JavaScript

**Mitigations**:
- ✅ Strict CSP: Content Security Policy headers
- ✅ Input sanitization: All user input sanitized
- ✅ Output encoding: HTML entities escaped
- ✅ HttpOnly cookies: JavaScript cannot access
- ✅ SameSite cookies: CSRF protection

**Result**: XSS attacks prevented

### 8. CSRF (Cross-Site Request Forgery)

**Threat**: Trick user into making requests

**Mitigations**:
- ✅ SameSite cookies: Strict same-site policy
- ✅ CSRF tokens: Required for state-changing operations
- ✅ Origin validation: Check request origin
- ✅ Custom headers: Require X-Requested-With

**Result**: CSRF attacks prevented

### 9. Clickjacking

**Threat**: Trick user into clicking hidden elements

**Mitigations**:
- ✅ X-Frame-Options: DENY
- ✅ CSP frame-ancestors: 'none'
- ✅ Frameguard: Helmet middleware

**Result**: Clickjacking prevented

### 10. Server Compromise

**Threat**: Attacker gains full server access

**Impact**:
- ❌ Can read database (encrypted blobs only)
- ❌ Can read logs (no sensitive data)
- ❌ Can read memory (no decryption keys)
- ❌ Can read backups (encrypted)
- ✅ CANNOT decrypt vault items
- ✅ CANNOT derive encryption keys
- ✅ CANNOT impersonate users

**Result**: Zero-knowledge architecture protects user data

## Compliance

### GDPR (General Data Protection Regulation)

- ✅ **Data minimization**: Only encrypted data stored
- ✅ **Right to erasure**: Delete user deletes all data
- ✅ **Data portability**: Export encrypted vault
- ✅ **Privacy by design**: Zero-knowledge architecture
- ✅ **Consent**: Explicit user consent required
- ✅ **Breach notification**: Audit logs track access

### SOC 2 (Service Organization Control)

- ✅ **Access controls**: Role-based permissions
- ✅ **Audit logging**: All access logged
- ✅ **Encryption**: At rest and in transit
- ✅ **Availability**: Database backups, redundancy
- ✅ **Monitoring**: Health checks, alerts

### HIPAA (Health Insurance Portability and Accountability Act)

- ✅ **Encryption**: AES-256-GCM
- ✅ **Access controls**: RBAC
- ✅ **Audit trails**: Comprehensive logging
- ✅ **Data integrity**: GCM authentication
- ✅ **Transmission security**: TLS 1.3

## Security Best Practices

### For Users

1. **Strong master password**: 16+ characters, unique
2. **Enable 2FA**: TOTP-based two-factor authentication
3. **Unique passwords**: Never reuse master password
4. **Regular audits**: Review access logs monthly
5. **Device management**: Remove old/unused devices
6. **Secure devices**: Use device encryption, screen lock
7. **Verify URLs**: Always check you're on correct domain
8. **Logout when done**: Don't leave vault unlocked

### For Administrators

1. **Rotate secrets**: Change JWT secrets every 90 days
2. **Monitor logs**: Check for suspicious activity
3. **Database backups**: Daily encrypted backups
4. **Update dependencies**: Keep all packages updated
5. **Security audits**: Annual third-party review
6. **Incident response**: Have plan for breaches
7. **Rate limiting**: Tune based on usage patterns
8. **Resource monitoring**: CPU, memory, disk usage

### For Developers

1. **Never log sensitive data**: No passwords, keys in logs
2. **Validate all inputs**: Use Zod schemas
3. **Parameterized queries**: Prevent SQL injection
4. **Security headers**: CSP, HSTS, X-Frame-Options
5. **Code reviews**: Security-focused reviews
6. **Dependency scanning**: Check for vulnerabilities
7. **Constant-time operations**: Prevent timing attacks
8. **Fail securely**: Default to deny access

## Threat Model

### In Scope

- ✅ Full server compromise
- ✅ Database breach
- ✅ Log inspection
- ✅ Backup theft
- ✅ Network eavesdropping
- ✅ Brute force attacks
- ✅ Insider threats
- ✅ Timing attacks
- ✅ Replay attacks
- ✅ SQL injection
- ✅ XSS/CSRF
- ✅ Clickjacking

### Out of Scope

- ❌ Client-side malware (keyloggers)
- ❌ Physical device theft (use device encryption)
- ❌ Social engineering (user training)
- ❌ Quantum computers (for now)
- ❌ Nation-state actors with unlimited resources

## Future Enhancements

### Planned

1. **Hardware security keys**: WebAuthn/FIDO2 support
2. **Biometric unlock**: Device-based biometrics
3. **Emergency access**: Trusted contacts
4. **Secure password sharing**: Time-limited links
5. **Breach monitoring**: HaveIBeenPwned integration
6. **Key rotation**: Automated key rotation
7. **Audit reports**: Automated compliance reports

### Considered

1. **Post-quantum crypto**: When standards mature
2. **Secure enclaves**: TEE for key storage
3. **Zero-knowledge proofs**: For authentication
4. **Homomorphic encryption**: For search
5. **Multi-party computation**: For recovery

## Security Contacts

**For security vulnerabilities**:
- Email: security@example.com
- **DO NOT** open public issues
- PGP key: [link to public key]

**Bug bounty program**: Coming soon

## Conclusion

This vault implements **true zero-knowledge architecture** where the server is treated as **untrusted storage**. Even with full server compromise, database leak, and log inspection, user data remains secure. The system uses industry-standard cryptography (Argon2id, AES-256-GCM, RSA-OAEP) with defense-in-depth security measures.

**The server NEVER sees, stores, or can decrypt user secrets.**
