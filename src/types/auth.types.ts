import { User } from '@prisma/client';

export interface JwtPayload {
  sub: number; // user ID
  email: string;
  iat?: number; // issued at
  exp?: number; // expires at
}

export type AuthenticatedUser = Pick<User, 'id' | 'email'>;
