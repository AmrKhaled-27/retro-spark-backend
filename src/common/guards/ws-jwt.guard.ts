import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedUser, JwtPayload } from 'src/types/auth.types';
import { SocketWithUser } from 'src/types/socket';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsException.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<SocketWithUser>();
    const token = client.handshake.auth?.token || client.handshake.headers.authorization;

    if (!token) {
      this.logger.error('Token missing');
      throw new WsException('Token missing');
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

      client.user = user;
      return true;
    } catch {
      throw new WsException('Invalid or expired token');
    }
  }
}
