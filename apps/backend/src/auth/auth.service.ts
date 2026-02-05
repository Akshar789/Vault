import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseClientService } from '../database/supabase-client.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly supabaseClient: SupabaseClientService,
    private readonly redisService: RedisService,
  ) {}

  async register(registerDto: any) {
    const { email, authHash, encryptedPrivateKey, publicKey, salt } = registerDto;

    try {
      // Hash the auth hash (double hashing for security)
      const hashedAuthHash = await bcrypt.hash(authHash, 12);

      // Create user using Supabase REST API
      const userId = uuidv4();
      const user = await this.supabaseClient.insert('users', {
        id: userId,
        email,
        auth_hash: hashedAuthHash,
        encrypted_private_key: encryptedPrivateKey || '',
        public_key: publicKey || '',
        salt,
      });

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
        salt,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(loginDto: any) {
    const { email, authHash } = loginDto;

    // Find user using Supabase REST API
    const users = await this.supabaseClient.select('users', {
      eq: { email },
      limit: 1,
    });

    if (!users || users.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = users[0];

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

    // Get user using Supabase REST API
    const users = await this.supabaseClient.select('users', {
      select: 'id,email',
      eq: { id: userId },
      limit: 1,
    });

    if (!users || users.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    const user = users[0];

    // Generate new tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const newRefreshToken = await this.generateRefreshToken(user.id);

    // Delete old refresh token
    await this.redisService.delete(`refresh:${refreshToken}`);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(logoutDto: any) {
    const { refreshToken } = logoutDto;

    // Delete refresh token from Redis
    await this.redisService.delete(`refresh:${refreshToken}`);

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

    try {
      // Store in Redis with 7 day expiry
      await this.redisService.set(
        `refresh:${refreshToken}`,
        userId,
        7 * 24 * 60 * 60,
      );
    } catch (error) {
      console.error('Redis error (non-fatal):', error.message);
      // Continue even if Redis fails - refresh tokens just won't persist
    }

    return refreshToken;
  }
}
