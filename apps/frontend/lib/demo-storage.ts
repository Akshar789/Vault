/**
 * Demo Storage - Local browser storage for testing without backend
 * 
 * This allows you to test the full app functionality without a backend connection
 */

export interface DemoUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export interface DemoVaultItem {
  id: string;
  userId: string;
  type: 'login' | 'note' | 'card';
  name: string;
  encryptedData: string;
  iv: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DemoSharedItem {
  id: string;
  itemId: string;
  ownerId: string;
  ownerEmail: string;
  recipientId: string;
  recipientEmail: string;
  permission: 'view' | 'edit';
  itemType: 'login' | 'note' | 'card';
  itemName: string;
  encryptedData: string;
  iv: string;
  sharedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
}

class DemoStorage {
  private USERS_KEY = 'demo_users';
  private ITEMS_KEY = 'demo_vault_items';
  private SESSION_KEY = 'demo_session';
  private SHARES_KEY = 'demo_shared_items';

  // User management
  getUsers(): DemoUser[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  saveUser(user: DemoUser): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  findUserByEmail(email: string): DemoUser | null {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  findUserById(userId: string): DemoUser | null {
    const users = this.getUsers();
    return users.find(u => u.id === userId) || null;
  }

  // Session management
  setSession(userId: string, email: string): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify({ userId, email }));
  }

  getSession(): { userId: string; email: string } | null {
    const session = localStorage.getItem(this.SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  // Vault items management
  getItems(userId: string): DemoVaultItem[] {
    const items = localStorage.getItem(this.ITEMS_KEY);
    const allItems: DemoVaultItem[] = items ? JSON.parse(items) : [];
    return allItems.filter(item => item.userId === userId);
  }

  saveItem(item: DemoVaultItem): void {
    const items = localStorage.getItem(this.ITEMS_KEY);
    const allItems: DemoVaultItem[] = items ? JSON.parse(items) : [];
    allItems.push(item);
    localStorage.setItem(this.ITEMS_KEY, JSON.stringify(allItems));
  }

  updateItem(itemId: string, updates: Partial<DemoVaultItem>): void {
    const items = localStorage.getItem(this.ITEMS_KEY);
    const allItems: DemoVaultItem[] = items ? JSON.parse(items) : [];
    const index = allItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      allItems[index] = { ...allItems[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(this.ITEMS_KEY, JSON.stringify(allItems));
    }
  }

  deleteItem(itemId: string): void {
    const items = localStorage.getItem(this.ITEMS_KEY);
    const allItems: DemoVaultItem[] = items ? JSON.parse(items) : [];
    const filtered = allItems.filter(item => item.id !== itemId);
    localStorage.setItem(this.ITEMS_KEY, JSON.stringify(filtered));
  }

  getItemById(itemId: string): DemoVaultItem | null {
    const items = localStorage.getItem(this.ITEMS_KEY);
    const allItems: DemoVaultItem[] = items ? JSON.parse(items) : [];
    return allItems.find(item => item.id === itemId) || null;
  }

  // Sharing management
  getSharedItems(): DemoSharedItem[] {
    const shares = localStorage.getItem(this.SHARES_KEY);
    return shares ? JSON.parse(shares) : [];
  }

  getSharedWithMe(userId: string): DemoSharedItem[] {
    const shares = this.getSharedItems();
    return shares.filter(share => 
      share.recipientId === userId && 
      !share.revokedAt &&
      (!share.expiresAt || new Date(share.expiresAt) > new Date())
    );
  }

  getSharedByMe(userId: string): DemoSharedItem[] {
    const shares = this.getSharedItems();
    return shares.filter(share => share.ownerId === userId);
  }

  getSharesForItem(itemId: string): DemoSharedItem[] {
    const shares = this.getSharedItems();
    return shares.filter(share => share.itemId === itemId && !share.revokedAt);
  }

  shareItem(share: DemoSharedItem): void {
    const shares = this.getSharedItems();
    shares.push(share);
    localStorage.setItem(this.SHARES_KEY, JSON.stringify(shares));
  }

  revokeShare(shareId: string): void {
    const shares = this.getSharedItems();
    const index = shares.findIndex(s => s.id === shareId);
    if (index !== -1) {
      shares[index].revokedAt = new Date().toISOString();
      localStorage.setItem(this.SHARES_KEY, JSON.stringify(shares));
    }
  }

  updateShare(shareId: string, updates: Partial<DemoSharedItem>): void {
    const shares = this.getSharedItems();
    const index = shares.findIndex(s => s.id === shareId);
    if (index !== -1) {
      shares[index] = { ...shares[index], ...updates };
      localStorage.setItem(this.SHARES_KEY, JSON.stringify(shares));
    }
  }

  // Clear all demo data
  clearAll(): void {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.ITEMS_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.SHARES_KEY);
  }
}

export const demoStorage = new DemoStorage();
