import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly databaseService: DatabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    const { sub: userId, email } = payload;

    // Verify user exists
    const query = 'SELECT id, email FROM users WHERE id = $1';
    const result = await this.databaseService.query(query, [userId]);

    if (result.rows.length === 0) {
      throw new UnauthorizedException('User not found');
    }

    return { userId, email };
  }
}
