import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { cookies: { accessToken?: string } }>();
    const token = request.cookies?.accessToken;
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    const publicKey = fs.readFileSync(
      join(__dirname, '../../../keys/public-key.pem'),
    );
    try {
      const payload = await this.jwtService.verifyAsync<{
        [key: string]: any;
      }>(token, {
        algorithms: ['RS256'],
        issuer: 'ecommerce-store',
        secret: publicKey,
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
