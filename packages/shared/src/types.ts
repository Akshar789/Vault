import { z } from 'zod';

// =============================================================================
// SECURITY CONSTANTS
// =============================================================================

/**
 * Cryptographic algorithm identifiers
 * These are used for key versioning and algorithm agility
 */
export const CRYPTO_ALGORITHMS = {
  SYMMETRIC: 'AES-256-GCM',
  ASYMMETRIC: 'RSA-OAEP-256',
  KDF: 'Argon2id',
  AUTH_KDF: 'PBKDF2-SHA256',
} as const;

/**
 * Key version for forward compatibility
 * Increment when changing crypto algorithms
 */
export const CURRENT_KEY_VERSION = 1;

// =============================================================================
// ENUMS
// =============================================================================

export enum VaultItemType {
  LOGIN = 'login',
  SECURE_NOTE = 'secure_note',
  API_KEY = 'api_key',
  CARD = 'card',
}

export enum OrganizationRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  READ_ONLY = 'read_only',
}

export enum AuditAction {
  // Authentication
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  TOKEN_REFRESHED = 'token_refreshed',
  TOKEN_REVOKED = 'token_revoked',
  
  // 2FA
  TWO_FA_ENABLED = '2fa_enabled',
  TWO_FA_DISABLED = '2fa_disabled',
  TWO_FA_VERIFIED = '2fa_verified',
  TWO_FA_FAILED = '2fa_failed',
  
  // Vault items
  ITEM_CREATED = 'item_created',
  ITEM_ACCESSED = 'item_accessed',
  ITEM_UPDATED = 'item_updated',
  ITEM_DELETED = 'item_deleted',
  
  // Sharing
  ITEM_SHARED = 'item_shared',
  ITEM_UNSHARED = 'item_unshared',
  
  // Organizations
  ORG_CREATED = 'org_created',
  ORG_UPDATED = 'org_updated',
  ORG_DELETED = 'org_deleted',
  USER_INVITED = 'user_invited',
  USER_REMOVED = 'user_removed',
  ROLE_CHANGED = 'role_changed',
  
  // Account
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  PASSWORD_CHANGED = 'password_changed',
  DEVICE_ADDED = 'device_added',
  DEVICE_REMOVED = 'device_removed',
}

export enum DeviceType {
  WEB = 'web',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  CLI = 'cli',
}

// =============================================================================
// ENCRYPTED DATA STRUCTURES
// =============================================================================

/**
 * Encrypted blob format
 * 
 * SECURITY: Server stores this as opaque binary data
 * Server CANNOT and MUST NOT decrypt this
 * 
 * @property ciphertext - Base64-encoded encrypted data
 * @property iv - Base64-encoded initialization vector (96-bit for GCM)
 * @property tag - Base64-encoded authentication tag (128-bit for GCM)
 * @property version - Key version for algorithm agility
 */
export interface EncryptedBlob {
  ciphertext: string;
  iv: string;
  tag: string;
  version: number;
}

/**
 * Encrypted vault item as stored on server
 * 
 * SECURITY: All sensitive fields are encrypted client-side
 * Server only sees encrypted blobs and non-sensitive metadata
 */
export interface EncryptedVaultItem {
  id: string;
  userId: string;
  organizationId: string | null;
  collectionId: string | null;
  type: VaultItemType;
  
  // ENCRYPTED: Server cannot decrypt
  encryptedData: EncryptedBlob;
  
  // Metadata (not sensitive)
  createdAt: Date;
  updatedAt: Date;
  accessedAt: Date | null;
  
  // Key version for rotation
  keyVersion: number;
}

/**
 * Decrypted vault item (client-side only)
 * 
 * SECURITY: This NEVER exists on the server
 * Only exists in client memory during active session
 */
export interface VaultItem {
  id: string;
  userId: string;
  organizationId: string | null;
  collectionId: string | null;
  type: VaultItemType;
  name: string;
  data: VaultItemData;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  accessedAt: Date | null;
}

export type VaultItemData = LoginData | SecureNoteData | ApiKeyData | CardData;

export interface LoginData {
  username: string;
  password: string;
  url?: string;
  notes?: string;
  totp?: string;
  customFields?: CustomField[];
}

export interface SecureNoteData {
  content: string;
  customFields?: CustomField[];
}

export interface ApiKeyData {
  name: string;
  key: string;
  url?: string;
  notes?: string;
  expiresAt?: Date;
  customFields?: CustomField[];
}

export interface CardData {
  cardholderName: string;
  number: string;
  brand?: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  notes?: string;
  customFields?: CustomField[];
}

export interface CustomField {
  name: string;
  value: string;
  type: 'text' | 'password' | 'email' | 'url';
}

// =============================================================================
// USER & AUTHENTICATION
// =============================================================================

/**
 * KDF parameters for Argon2id
 * 
 * SECURITY: These are stored per-user to allow tuning
 * Higher values = more secure but slower
 */
export interface KdfParams {
  algorithm: 'Argon2id';
  memory: number;      // Memory cost in KB (e.g., 65536 = 64MB)
  iterations: number;  // Time cost (e.g., 3)
  parallelism: number; // Parallelism factor (e.g., 4)
  saltLength: number;  // Salt length in bytes (e.g., 16)
  hashLength: number;  // Output hash length in bytes (e.g., 32)
}

/**
 * User registration request
 * 
 * SECURITY CRITICAL:
 * - Master password NEVER sent to server
 * - Only auth hash sent (PBKDF2, different from encryption key)
 * - All keys encrypted client-side before transmission
 * - Server cannot derive encryption keys from auth hash
 */
export interface RegisterRequest {
  email: string;
  
  // PBKDF2 hash for authentication ONLY (not for encryption)
  masterPasswordHash: string;
  
  // User's RSA key pair (for sharing)
  encryptedPrivateKey: EncryptedBlob;
  publicKey: string; // PEM format
  
  // User's symmetric vault key
  encryptedSymmetricKey: EncryptedBlob;
  
  // KDF parameters for client-side key derivation
  kdfParams: KdfParams;
  kdfSalt: string; // Base64-encoded
  
  // Optional device info
  deviceName?: string;
  deviceType?: DeviceType;
}

/**
 * Login request
 * 
 * SECURITY: Only auth hash sent, never master password
 */
export interface LoginRequest {
  email: string;
  masterPasswordHash: string;
  twoFactorToken?: string;
  deviceName?: string;
  deviceType?: DeviceType;
  deviceFingerprint?: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  requiresTwoFactor: boolean;
  deviceId?: string;
}

/**
 * User profile
 * 
 * SECURITY: Contains encrypted keys that only user can decrypt
 */
export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  
  // Encrypted keys (server cannot decrypt)
  encryptedPrivateKey: EncryptedBlob;
  publicKey: string;
  encryptedSymmetricKey: EncryptedBlob;
  
  // KDF parameters
  kdfParams: KdfParams;
  kdfSalt: string;
  
  // Security settings
  twoFactorEnabled: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  
  // Key version
  keyVersion: number;
}

/**
 * Password change request
 * 
 * SECURITY: Zero-knowledge password change
 * 1. Client derives new master key from new password
 * 2. Client re-encrypts all keys with new master key
 * 3. Client derives new auth hash
 * 4. Server verifies old auth hash, stores new auth hash
 * 5. Server never sees old or new master password
 */
export interface PasswordChangeRequest {
  oldMasterPasswordHash: string;
  newMasterPasswordHash: string;
  newEncryptedPrivateKey: EncryptedBlob;
  newEncryptedSymmetricKey: EncryptedBlob;
  newKdfSalt: string;
  newKdfParams: KdfParams;
}

// =============================================================================
// SESSIONS & DEVICES
// =============================================================================

/**
 * Device session
 * 
 * SECURITY: Device-bound sessions for better security
 * Each device has separate refresh token
 */
export interface DeviceSession {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: DeviceType;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  lastUsedAt: Date;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
  deviceFingerprint?: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string; // New refresh token (rotation)
}

// =============================================================================
// ORGANIZATIONS & SHARING
// =============================================================================

/**
 * Organization
 * 
 * SECURITY: Organization has symmetric key encrypted per-member
 */
export interface Organization {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  
  // User's encrypted copy of org key
  encryptedOrgKey: EncryptedBlob;
  
  // Key version
  keyVersion: number;
}

/**
 * Organization member
 */
export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  userEmail: string;
  role: OrganizationRole;
  
  // Org key encrypted with member's public key
  encryptedOrgKey: EncryptedBlob;
  
  addedBy: string;
  addedAt: Date;
}

/**
 * Collection (folder within organization)
 */
export interface Collection {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create organization request
 * 
 * SECURITY: Creator provides org key encrypted with their public key
 */
export interface CreateOrganizationRequest {
  name: string;
  encryptedOrgKey: EncryptedBlob;
}

/**
 * Invite user to organization request
 * 
 * SECURITY CRITICAL:
 * - Inviter decrypts org key with their private key (client-side)
 * - Inviter encrypts org key with invitee's public key (client-side)
 * - Server only stores encrypted blob
 * - Server cannot decrypt org key
 */
export interface InviteUserRequest {
  email: string;
  role: OrganizationRole;
  encryptedOrgKey: EncryptedBlob; // Org key encrypted with invitee's public key
}

// =============================================================================
// VAULT OPERATIONS
// =============================================================================

/**
 * Create vault item request
 */
export interface CreateVaultItemRequest {
  type: VaultItemType;
  encryptedData: EncryptedBlob;
  organizationId?: string;
  collectionId?: string;
}

/**
 * Update vault item request
 */
export interface UpdateVaultItemRequest {
  encryptedData: EncryptedBlob;
  collectionId?: string;
}

// =============================================================================
// AUDIT LOGS
// =============================================================================

/**
 * Audit log entry
 * 
 * SECURITY CRITICAL: NO SENSITIVE DATA IN LOGS
 * - No passwords
 * - No encryption keys
 * - No plaintext vault data
 * - Only metadata for compliance
 */
export interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  organizationId: string | null;
  action: AuditAction;
  resourceType: string | null;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceId: string | null;
  success: boolean;
  errorMessage: string | null;
  metadata: Record<string, any> | null; // Sanitized metadata only
  timestamp: Date;
}

// =============================================================================
// 2FA
// =============================================================================

/**
 * 2FA setup response
 */
export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

/**
 * 2FA verification request
 */
export interface TwoFactorVerifyRequest {
  token: string;
}

// =============================================================================
// VALIDATION SCHEMAS (Zod)
// =============================================================================

export const emailSchema = z.string().email().max(255).toLowerCase();
export const uuidSchema = z.string().uuid();
export const passwordHashSchema = z.string().min(64).max(256);

export const encryptedBlobSchema = z.object({
  ciphertext: z.string().min(1),
  iv: z.string().min(1),
  tag: z.string().min(1),
  version: z.number().int().min(1),
});

export const kdfParamsSchema = z.object({
  algorithm: z.literal('Argon2id'),
  memory: z.number().int().min(1024).max(1048576), // 1MB to 1GB
  iterations: z.number().int().min(1).max(100),
  parallelism: z.number().int().min(1).max(64),
  saltLength: z.number().int().min(16).max(64),
  hashLength: z.number().int().min(16).max(64),
});

export const registerSchema = z.object({
  email: emailSchema,
  masterPasswordHash: passwordHashSchema,
  encryptedPrivateKey: encryptedBlobSchema,
  publicKey: z.string().min(1),
  encryptedSymmetricKey: encryptedBlobSchema,
  kdfParams: kdfParamsSchema,
  kdfSalt: z.string().min(1),
  deviceName: z.string().max(100).optional(),
  deviceType: z.nativeEnum(DeviceType).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  masterPasswordHash: passwordHashSchema,
  twoFactorToken: z.string().length(6).optional(),
  deviceName: z.string().max(100).optional(),
  deviceType: z.nativeEnum(DeviceType).optional(),
  deviceFingerprint: z.string().max(256).optional(),
});

export const createVaultItemSchema = z.object({
  type: z.nativeEnum(VaultItemType),
  encryptedData: encryptedBlobSchema,
  organizationId: uuidSchema.optional(),
  collectionId: uuidSchema.optional(),
});

export const updateVaultItemSchema = z.object({
  encryptedData: encryptedBlobSchema,
  collectionId: uuidSchema.optional(),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  encryptedOrgKey: encryptedBlobSchema,
});

export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.nativeEnum(OrganizationRole),
  encryptedOrgKey: encryptedBlobSchema,
});

export const passwordChangeSchema = z.object({
  oldMasterPasswordHash: passwordHashSchema,
  newMasterPasswordHash: passwordHashSchema,
  newEncryptedPrivateKey: encryptedBlobSchema,
  newEncryptedSymmetricKey: encryptedBlobSchema,
  newKdfSalt: z.string().min(1),
  newKdfParams: kdfParamsSchema,
});

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// =============================================================================
// ERROR CODES
// =============================================================================

export enum ErrorCode {
  // Authentication
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  TWO_FACTOR_REQUIRED = 'TWO_FACTOR_REQUIRED',
  INVALID_TWO_FACTOR = 'INVALID_TWO_FACTOR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  REFRESH_TOKEN_REUSED = 'REFRESH_TOKEN_REUSED',
  
  // Authorization
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  
  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
