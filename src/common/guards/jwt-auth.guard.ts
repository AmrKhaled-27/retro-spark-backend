import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload, AuthenticatedUser } from '../../types/auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookies(request);

    if (!token) {
      throw new UnauthorizedException('Access token not found');
    }

    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      })) as JwtPayload;

      // Transform payload to user object and attach to request
      const user: AuthenticatedUser = {
        id: payload.sub,
        email: payload.email,
      };

      request.user = user;
    } catch (error) {
      console.error('JWT verification failed:', error);
      throw new UnauthorizedException('Invalid or expired access token');
    }

    return true;
  }

  private extractTokenFromCookies(request: Request): string | undefined {
    return request.cookies?.access_token;
  }
}

export const AuthGuard = () => UseGuards(JwtAuthGuard);
