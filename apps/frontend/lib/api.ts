/**
 * API Client for Zero-Knowledge Vault
 * 
 * Handles all communication with the backend API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('encryptionKey');
      localStorage.removeItem('userEmail');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Try to refresh token if 401
        if (response.status === 401 && this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry original request
            return this.request(endpoint, options);
          }
        }

        return { error: data.message || 'Request failed' };
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Network error' };
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return false;
      }

      const data = await response.json();
      this.setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }

  // Auth endpoints
  async register(email: string, authHash: string, encryptedPrivateKey: string, publicKey: string, salt: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        authHash,
        encryptedPrivateKey,
        publicKey,
        salt,
      }),
    });
  }

  async login(email: string, authHash: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, authHash }),
    });
  }

  async logout() {
    const result = await this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });
    this.clearTokens();
    return result;
  }

  // Vault endpoints
  async getItems() {
    return this.request('/vault/items', { method: 'GET' });
  }

  async getItem(id: string) {
    return this.request(`/vault/items/${id}`, { method: 'GET' });
  }

  async createItem(type: string, name: string, encryptedData: string, iv: string, favorite: boolean = false) {
    return this.request('/vault/items', {
      method: 'POST',
      body: JSON.stringify({
        type,
        name,
        encryptedData,
        iv,
        favorite,
      }),
    });
  }

  async updateItem(id: string, type: string, name: string, encryptedData: string, iv: string, favorite: boolean) {
    return this.request(`/vault/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        type,
        name,
        encryptedData,
        iv,
        favorite,
      }),
    });
  }

  async deleteItem(id: string) {
    return this.request(`/vault/items/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
