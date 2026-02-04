import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class VaultService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getItems(userId: string) {
    const query = `
      SELECT id, type, name, encrypted_data, iv, favorite, created_at, updated_at
      FROM vault_items
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY favorite DESC, updated_at DESC
    `;

    const result = await this.databaseService.query(query, [userId]);
    return result.rows;
  }

  async getItem(userId: string, itemId: string) {
    const query = `
      SELECT id, type, name, encrypted_data, iv, favorite, created_at, updated_at
      FROM vault_items
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;

    const result = await this.databaseService.query(query, [itemId, userId]);

    if (result.rows.length === 0) {
      throw new NotFoundException('Item not found');
    }

    return result.rows[0];
  }

  async createItem(userId: string, createItemDto: any) {
    const { type, name, encryptedData, iv, favorite = false } = createItemDto;

    const itemId = uuidv4();
    const query = `
      INSERT INTO vault_items (id, user_id, type, name, encrypted_data, iv, favorite)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, type, name, encrypted_data, iv, favorite, created_at, updated_at
    `;

    const result = await this.databaseService.query(query, [
      itemId,
      userId,
      type,
      name,
      encryptedData,
      iv,
      favorite,
    ]);

    return result.rows[0];
  }

  async updateItem(userId: string, itemId: string, updateItemDto: any) {
    // Verify ownership
    const checkQuery = 'SELECT id FROM vault_items WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL';
    const checkResult = await this.databaseService.query(checkQuery, [itemId, userId]);

    if (checkResult.rows.length === 0) {
      throw new NotFoundException('Item not found');
    }

    const { type, name, encryptedData, iv, favorite } = updateItemDto;

    const query = `
      UPDATE vault_items
      SET type = $1, name = $2, encrypted_data = $3, iv = $4, favorite = $5, updated_at = NOW()
      WHERE id = $6 AND user_id = $7
      RETURNING id, type, name, encrypted_data, iv, favorite, created_at, updated_at
    `;

    const result = await this.databaseService.query(query, [
      type,
      name,
      encryptedData,
      iv,
      favorite,
      itemId,
      userId,
    ]);

    return result.rows[0];
  }

  async deleteItem(userId: string, itemId: string) {
    // Verify ownership
    const checkQuery = 'SELECT id FROM vault_items WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL';
    const checkResult = await this.databaseService.query(checkQuery, [itemId, userId]);

    if (checkResult.rows.length === 0) {
      throw new NotFoundException('Item not found');
    }

    // Soft delete
    const query = 'UPDATE vault_items SET deleted_at = NOW() WHERE id = $1 AND user_id = $2';
    await this.databaseService.query(query, [itemId, userId]);

    return { message: 'Item deleted successfully' };
  }
}
