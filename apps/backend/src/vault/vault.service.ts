import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseClientService } from '../database/supabase-client.service';

@Injectable()
export class VaultService {
  constructor(private readonly supabaseClient: SupabaseClientService) {}

  async getItems(userId: string) {
    const items = await this.supabaseClient.select('vault_items', {
      select: 'id,type,name,encrypted_data,iv,favorite,created_at,updated_at',
      eq: { user_id: userId },
      order: 'favorite.desc,updated_at.desc',
    });

    return items || [];
  }

  async getItem(userId: string, itemId: string) {
    const items = await this.supabaseClient.select('vault_items', {
      select: 'id,type,name,encrypted_data,iv,favorite,created_at,updated_at',
      eq: { id: itemId, user_id: userId },
      limit: 1,
    });

    if (!items || items.length === 0) {
      throw new NotFoundException('Item not found');
    }

    return items[0];
  }

  async createItem(userId: string, createItemDto: any) {
    const { type, name, encryptedData, iv, favorite = false } = createItemDto;

    const item = await this.supabaseClient.insert('vault_items', {
      id: uuidv4(),
      user_id: userId,
      type,
      name,
      encrypted_data: encryptedData,
      iv,
      favorite,
    });

    return item;
  }

  async updateItem(userId: string, itemId: string, updateItemDto: any) {
    // Verify ownership
    const existing = await this.supabaseClient.select('vault_items', {
      select: 'id',
      eq: { id: itemId, user_id: userId },
      limit: 1,
    });

    if (!existing || existing.length === 0) {
      throw new NotFoundException('Item not found');
    }

    const { type, name, encryptedData, iv, favorite } = updateItemDto;

    const item = await this.supabaseClient.update(
      'vault_items',
      {
        type,
        name,
        encrypted_data: encryptedData,
        iv,
        favorite,
        updated_at: new Date().toISOString(),
      },
      { id: itemId, user_id: userId }
    );

    return item;
  }

  async deleteItem(userId: string, itemId: string) {
    // Verify ownership
    const existing = await this.supabaseClient.select('vault_items', {
      select: 'id',
      eq: { id: itemId, user_id: userId },
      limit: 1,
    });

    if (!existing || existing.length === 0) {
      throw new NotFoundException('Item not found');
    }

    // Delete item
    await this.supabaseClient.delete('vault_items', {
      id: itemId,
      user_id: userId,
    });

    return { message: 'Item deleted successfully' };
  }
}
