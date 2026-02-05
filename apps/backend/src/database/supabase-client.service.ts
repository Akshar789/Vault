import { Injectable } from '@nestjs/common';

/**
 * Supabase REST API Client
 * 
 * Uses Supabase REST API instead of direct PostgreSQL connection
 * This bypasses IPv6 connectivity issues on Railway
 */
@Injectable()
export class SupabaseClientService {
  private readonly supabaseUrl: string;
  private readonly supabaseKey: string;

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn('⚠️  Supabase credentials not configured');
    }
  }

  /**
   * Execute a SELECT query
   */
  async select(table: string, options: any = {}): Promise<any> {
    const { select = '*', eq, limit, order } = options;
    
    let url = `${this.supabaseUrl}/rest/v1/${table}?select=${select}`;
    
    if (eq) {
      Object.keys(eq).forEach(key => {
        url += `&${key}=eq.${eq[key]}`;
      });
    }
    
    if (limit) {
      url += `&limit=${limit}`;
    }
    
    if (order) {
      url += `&order=${order}`;
    }

    const response = await fetch(url, {
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase SELECT error: ${error}`);
    }

    return response.json();
  }

  /**
   * Execute an INSERT query
   */
  async insert(table: string, data: any): Promise<any> {
    const url = `${this.supabaseUrl}/rest/v1/${table}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase INSERT error: ${error}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Execute an UPDATE query
   */
  async update(table: string, data: any, eq: any): Promise<any> {
    let url = `${this.supabaseUrl}/rest/v1/${table}?`;
    
    Object.keys(eq).forEach((key, index) => {
      if (index > 0) url += '&';
      url += `${key}=eq.${eq[key]}`;
    });

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase UPDATE error: ${error}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result[0] : result;
  }

  /**
   * Execute a DELETE query
   */
  async delete(table: string, eq: any): Promise<void> {
    let url = `${this.supabaseUrl}/rest/v1/${table}?`;
    
    Object.keys(eq).forEach((key, index) => {
      if (index > 0) url += '&';
      url += `${key}=eq.${eq[key]}`;
    });

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Supabase DELETE error: ${error}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': this.supabaseKey,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Supabase health check failed:', error);
      return false;
    }
  }
}
