/**
 * Vault Manager - Handles encryption/decryption and API sync
 */

import { api } from './api';
import { deriveKey, encrypt, decrypt, generateSalt, hash } from './crypto';

export interface VaultItem {
  id: string;
  type: 'login' | 'note' | 'card';
  name: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

class VaultManager {
  private encryptionKey: CryptoKey | null = null;
  private masterPassword: string | null = null;
  private salt: Uint8Array | null = null;

  async initialize(masterPassword: string, saltBase64: string) {
    this.masterPassword = masterPassword;
    this.salt = this.base64ToBuffer(saltBase64);
    
    // Derive encryption key from master password
    this.encryptionKey = await deriveKey(masterPassword, this.salt);
    
    // Store salt for later use
    if (typeof window !== 'undefined') {
      localStorage.setItem('salt', saltBase64);
    }
  }

  async register(email: string, masterPassword: string) {
    // Generate salt
    const salt = generateSalt();
    const saltBase64 = this.bufferToBase64(salt);

    // Derive encryption key
    const encryptionKey = await deriveKey(masterPassword, salt);

    // Generate auth hash (different from encryption key)
    const authHash = await hash(masterPassword + email);

    // For now, we'll use placeholder RSA keys
    // In production, generate actual RSA key pair
    const publicKey = 'placeholder-public-key';
    const encryptedPrivateKey = 'placeholder-encrypted-private-key';

    // Register with API
    const response = await api.register(
      email,
      authHash,
      encryptedPrivateKey,
      publicKey,
      saltBase64
    );

    if (response.error) {
      throw new Error(response.error);
    }

    // Store tokens
    api.setTokens(response.data.accessToken, response.data.refreshToken);

    // Initialize vault
    await this.initialize(masterPassword, saltBase64);

    // Store user email
    if (typeof window !== 'undefined') {
      localStorage.setItem('userEmail', email);
    }

    return response.data;
  }

  async login(email: string, masterPassword: string) {
    // Generate auth hash
    const authHash = await hash(masterPassword + email);

    // Login with API
    const response = await api.login(email, authHash);

    if (response.error) {
      throw new Error(response.error);
    }

    // Store tokens
    api.setTokens(response.data.accessToken, response.data.refreshToken);

    // Initialize vault with returned salt
    await this.initialize(masterPassword, response.data.salt);

    // Store user email
    if (typeof window !== 'undefined') {
      localStorage.setItem('userEmail', email);
    }

    return response.data;
  }

  async logout() {
    await api.logout();
    this.encryptionKey = null;
    this.masterPassword = null;
    this.salt = null;
  }

  async getItems(): Promise<VaultItem[]> {
    if (!this.encryptionKey) {
      throw new Error('Vault not initialized');
    }

    const response = await api.getItems();

    if (response.error) {
      throw new Error(response.error);
    }

    // Decrypt all items
    const items = await Promise.all(
      response.data.map(async (item: any) => {
        const decryptedData = await decrypt(
          item.encrypted_data,
          item.iv,
          this.encryptionKey!
        );
        const data = JSON.parse(decryptedData);

        return {
          id: item.id,
          type: item.type,
          name: item.name,
          ...data,
          favorite: item.favorite,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        };
      })
    );

    return items;
  }

  async createItem(item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<VaultItem> {
    if (!this.encryptionKey) {
      throw new Error('Vault not initialized');
    }

    // Extract sensitive data to encrypt
    const { type, name, favorite, ...sensitiveData } = item;

    // Encrypt sensitive data
    const { ciphertext, iv } = await encrypt(
      JSON.stringify(sensitiveData),
      this.encryptionKey
    );

    // Create item via API
    const response = await api.createItem(type, name, ciphertext, iv, favorite);

    if (response.error) {
      throw new Error(response.error);
    }

    // Return decrypted item
    return {
      id: response.data.id,
      type: response.data.type,
      name: response.data.name,
      ...sensitiveData,
      favorite: response.data.favorite,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
    };
  }

  async updateItem(id: string, item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<VaultItem> {
    if (!this.encryptionKey) {
      throw new Error('Vault not initialized');
    }

    // Extract sensitive data to encrypt
    const { type, name, favorite, ...sensitiveData } = item;

    // Encrypt sensitive data
    const { ciphertext, iv } = await encrypt(
      JSON.stringify(sensitiveData),
      this.encryptionKey
    );

    // Update item via API
    const response = await api.updateItem(id, type, name, ciphertext, iv, favorite);

    if (response.error) {
      throw new Error(response.error);
    }

    // Return decrypted item
    return {
      id: response.data.id,
      type: response.data.type,
      name: response.data.name,
      ...sensitiveData,
      favorite: response.data.favorite,
      createdAt: response.data.created_at,
      updatedAt: response.data.updated_at,
    };
  }

  async deleteItem(id: string): Promise<void> {
    const response = await api.deleteItem(id);

    if (response.error) {
      throw new Error(response.error);
    }
  }

  isInitialized(): boolean {
    return this.encryptionKey !== null;
  }

  private bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

export const vaultManager = new VaultManager();
