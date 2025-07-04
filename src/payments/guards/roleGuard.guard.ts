import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

// Extend Express Request interface to include 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: { role?: string };
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { role?: string };

    const isAdmin = user?.role === 'admin';
    if (!isAdmin) {
      throw new UnauthorizedException(
        'You do not have permission to access this resource.',
      );
    }
    return true;
  }
}
