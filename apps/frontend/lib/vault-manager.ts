/**
 * Vault Manager - Handles encryption/decryption and API sync
 */

import { api } from './api';
import { deriveKey, encrypt, decrypt, generateSalt, hash } from './crypto';
import { demoStorage } from './demo-storage';

// Demo mode flag
const DEMO_MODE = true; // Set to false when backend is ready

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
  isShared?: boolean;
  sharedBy?: string;
  permission?: 'view' | 'edit';
}

export interface ShareInfo {
  id: string;
  recipientEmail: string;
  permission: 'view' | 'edit';
  sharedAt: string;
  expiresAt: string | null;
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

    if (DEMO_MODE) {
      // Demo mode - store locally
      const userId = Date.now().toString();
      demoStorage.saveUser({
        id: userId,
        email,
        passwordHash: authHash,
        salt: saltBase64,
        createdAt: new Date().toISOString(),
      });
      demoStorage.setSession(userId, email);
      
      // Initialize vault
      await this.initialize(masterPassword, saltBase64);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', email);
      }
      
      return { user: { id: userId, email } };
    }

    // Production mode - use API
    const publicKey = 'placeholder-public-key';
    const encryptedPrivateKey = 'placeholder-encrypted-private-key';

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

    const data = response.data as any;
    api.setTokens(data.accessToken, data.refreshToken);
    await this.initialize(masterPassword, saltBase64);

    if (typeof window !== 'undefined') {
      localStorage.setItem('userEmail', email);
    }

    return data;
  }

  async login(email: string, masterPassword: string) {
    // Generate auth hash
    const authHash = await hash(masterPassword + email);

    if (DEMO_MODE) {
      // Demo mode - check local storage
      const user = demoStorage.findUserByEmail(email);
      if (!user || user.passwordHash !== authHash) {
        throw new Error('Invalid email or password');
      }
      
      demoStorage.setSession(user.id, email);
      await this.initialize(masterPassword, user.salt);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', email);
      }
      
      return { user: { id: user.id, email } };
    }

    // Production mode - use API
    const response = await api.login(email, authHash);

    if (response.error) {
      throw new Error(response.error);
    }

    const data = response.data as any;
    api.setTokens(data.accessToken, data.refreshToken);
    await this.initialize(masterPassword, data.salt);

    if (typeof window !== 'undefined') {
      localStorage.setItem('userEmail', email);
    }

    return data;
  }

  async logout() {
    if (DEMO_MODE) {
      demoStorage.clearSession();
    } else {
      await api.logout();
    }
    this.encryptionKey = null;
    this.masterPassword = null;
    this.salt = null;
  }

  async getItems(): Promise<VaultItem[]> {
    if (!this.encryptionKey) {
      throw new Error('Vault not initialized');
    }

    if (DEMO_MODE) {
      // Demo mode - get from local storage
      const session = demoStorage.getSession();
      if (!session) {
        throw new Error('Not logged in');
      }
      
      // Get own items
      const items = demoStorage.getItems(session.userId);
      
      // Decrypt all items
      const decryptedItems = await Promise.all(
        items.map(async (item) => {
          const decryptedData = await decrypt(
            item.encryptedData,
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
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        })
      );
      
      // Get shared items
      const sharedItems = demoStorage.getSharedWithMe(session.userId);
      const decryptedSharedItems = await Promise.all(
        sharedItems.map(async (share) => {
          const decryptedData = await decrypt(
            share.encryptedData,
            share.iv,
            this.encryptionKey!
          );
          const data = JSON.parse(decryptedData);

          return {
            id: share.itemId,
            type: share.itemType,
            name: share.itemName,
            ...data,
            favorite: false,
            createdAt: share.sharedAt,
            updatedAt: share.sharedAt,
            isShared: true,
            sharedBy: share.ownerEmail,
            permission: share.permission,
          };
        })
      );
      
      return [...decryptedItems, ...decryptedSharedItems];
    }

    // Production mode - use API
    const response = await api.getItems();

    if (response.error) {
      throw new Error(response.error);
    }

    const data = response.data as any;
    // Decrypt all items
    const items = await Promise.all(
      data.map(async (item: any) => {
        const decryptedData = await decrypt(
          item.encrypted_data,
          item.iv,
          this.encryptionKey!
        );
        const itemData = JSON.parse(decryptedData);

        return {
          id: item.id,
          type: item.type,
          name: item.name,
          ...itemData,
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

    if (DEMO_MODE) {
      // Demo mode - save to local storage
      const session = demoStorage.getSession();
      if (!session) {
        throw new Error('Not logged in');
      }
      
      const newItem = {
        id: Date.now().toString(),
        userId: session.userId,
        type,
        name,
        encryptedData: ciphertext,
        iv,
        favorite,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      demoStorage.saveItem(newItem);
      
      return {
        id: newItem.id,
        type,
        name,
        ...sensitiveData,
        favorite,
        createdAt: newItem.createdAt,
        updatedAt: newItem.updatedAt,
      };
    }

    // Production mode - use API
    const response = await api.createItem(type, name, ciphertext, iv, favorite);

    if (response.error) {
      throw new Error(response.error);
    }

    const data = response.data as any;
    return {
      id: data.id,
      type: data.type,
      name: data.name,
      ...sensitiveData,
      favorite: data.favorite,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
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

    if (DEMO_MODE) {
      // Demo mode - update in local storage
      demoStorage.updateItem(id, {
        type,
        name,
        encryptedData: ciphertext,
        iv,
        favorite,
      });
      
      return {
        id,
        type,
        name,
        ...sensitiveData,
        favorite,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Production mode - use API
    const response = await api.updateItem(id, type, name, ciphertext, iv, favorite);

    if (response.error) {
      throw new Error(response.error);
    }

    const data = response.data as any;
    return {
      id: data.id,
      type: data.type,
      name: data.name,
      ...sensitiveData,
      favorite: data.favorite,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteItem(id: string): Promise<void> {
    if (DEMO_MODE) {
      // Demo mode - delete from local storage
      demoStorage.deleteItem(id);
      return;
    }

    // Production mode - use API
    const response = await api.deleteItem(id);

    if (response.error) {
      throw new Error(response.error);
    }
  }

  isInitialized(): boolean {
    return this.encryptionKey !== null;
  }

  // Sharing methods
  async shareItem(itemId: string, recipientEmail: string, permission: 'view' | 'edit' = 'view'): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('Vault not initialized');
    }

    if (DEMO_MODE) {
      const session = demoStorage.getSession();
      if (!session) {
        throw new Error('Not logged in');
      }

      // Check if recipient exists
      const recipient = demoStorage.findUserByEmail(recipientEmail);
      if (!recipient) {
        throw new Error('Recipient not found. They need to create an account first.');
      }

      // Get the item
      const item = demoStorage.getItemById(itemId);
      if (!item) {
        throw new Error('Item not found');
      }

      if (item.userId !== session.userId) {
        throw new Error('You can only share your own items');
      }

      // Check if already shared with this user
      const existingShares = demoStorage.getSharesForItem(itemId);
      const alreadyShared = existingShares.find(s => s.recipientEmail === recipientEmail && !s.revokedAt);
      if (alreadyShared) {
        throw new Error('Item already shared with this user');
      }

      // Create share
      const share = {
        id: Date.now().toString(),
        itemId: item.id,
        ownerId: session.userId,
        ownerEmail: session.email,
        recipientId: recipient.id,
        recipientEmail: recipient.email,
        permission,
        itemType: item.type,
        itemName: item.name,
        encryptedData: item.encryptedData,
        iv: item.iv,
        sharedAt: new Date().toISOString(),
        expiresAt: null,
        revokedAt: null,
      };

      demoStorage.shareItem(share);
      return;
    }

    // Production mode - use API
    throw new Error('Sharing not implemented in production mode yet');
  }

  async getSharesForItem(itemId: string): Promise<ShareInfo[]> {
    if (DEMO_MODE) {
      const shares = demoStorage.getSharesForItem(itemId);
      return shares.map(share => ({
        id: share.id,
        recipientEmail: share.recipientEmail,
        permission: share.permission,
        sharedAt: share.sharedAt,
        expiresAt: share.expiresAt,
      }));
    }

    // Production mode - use API
    throw new Error('Sharing not implemented in production mode yet');
  }

  async revokeShare(shareId: string): Promise<void> {
    if (DEMO_MODE) {
      demoStorage.revokeShare(shareId);
      return;
    }

    // Production mode - use API
    throw new Error('Sharing not implemented in production mode yet');
  }

  async updateSharePermission(shareId: string, permission: 'view' | 'edit'): Promise<void> {
    if (DEMO_MODE) {
      demoStorage.updateShare(shareId, { permission });
      return;
    }

    // Production mode - use API
    throw new Error('Sharing not implemented in production mode yet');
  }

  private bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
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
