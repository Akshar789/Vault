import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  async register(registerDto: any) {
    const { email, authHash, encryptedPrivateKey, publicKey, salt } = registerDto;

    // Hash the auth hash (double hashing for security)
    const hashedAuthHash = await bcrypt.hash(authHash, 12);

    // Create user
    const userId = uuidv4();
    const query = `
      INSERT INTO users (id, email, auth_hash, encrypted_private_key, public_key, salt)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, created_at
    `;

    const result = await this.databaseService.query(query, [
      userId,
      email,
      hashedAuthHash,
      encryptedPrivateKey,
      publicKey,
      salt,
    ]);

    const user = result.rows[0];

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
      refreshToken,
      encryptedPrivateKey,
      publicKey,
    };
  }

  async login(loginDto: any) {
    const { email, authHash } = loginDto;

    // Find user
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.databaseService.query(query, [email]);

    if (result.rows.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify auth hash
    const isValid = await bcrypt.compare(authHash, user.auth_hash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      accessToken,
      refreshToken,
      encryptedPrivateKey: user.encrypted_private_key,
      publicKey: user.public_key,
      salt: user.salt,
    };
  }

  async refreshToken(refreshDto: any) {
    const { refreshToken } = refreshDto;

    // Verify refresh token exists in Redis
    const userId = await this.redisService.get(`refresh:${refreshToken}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user
    const query = 'SELECT id, email FROM users WHERE id = $1';
    const result = await this.databaseService.query(query, [userId]);

    if (result.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const user = result.rows[0];

    // Generate new tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    // Delete old refresh token
    await this.redisService.del(`refresh:${refreshToken}`);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(logoutDto: any) {
    const { refreshToken } = logoutDto;

    // Delete refresh token from Redis
    await this.redisService.del(`refresh:${refreshToken}`);

    return { message: 'Logged out successfully' };
  }

  private generateAccessToken(userId: string, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
      type: 'access',
    });
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = uuidv4();

    // Store in Redis with 7 day expiry
    await this.redisService.set(
      `refresh:${refreshToken}`,
      userId,
      7 * 24 * 60 * 60,
    );

    return refreshToken;
  }
}
