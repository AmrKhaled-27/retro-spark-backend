import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../../types/auth.types';
import { Request } from 'express';
import { SocketWithUser } from 'src/types/socket';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>(); // HTTP
    const socket = ctx.switchToWs().getClient<SocketWithUser>(); // Socket

    if (request) {
      return request.user;
    }

    if (socket) {
      return socket.user;
    }

    return null;
  },
);
