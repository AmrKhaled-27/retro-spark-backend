import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  SignupResponseDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
} from './dto/auth-response.dto';
import { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/jwt-auth.guard';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and returns authentication cookies. The access token and refresh token are set as HTTP-only cookies for security.',
  })
  @ApiCreatedResponse({
    type: SignupResponseDto,
    description: 'User has been successfully created and authenticated',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['email must be a valid email'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'User with this email already exists' },
        error: { type: 'string', example: 'Conflict' },
      },
    },
  })
  async signUp(@Body() signUpDto: SignUpDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.signUp(signUpDto);

    const accessExpiration = this.parseDuration(
      this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
    );
    const refreshExpiration = this.parseDuration(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
    );

    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      expires: new Date(Date.now() + accessExpiration),
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      expires: new Date(Date.now() + refreshExpiration),
    });

    return { message: 'Signup successful' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user',
    description:
      'Authenticates a user with email and password. Returns authentication cookies upon successful login.',
  })
  @ApiOkResponse({
    type: LoginResponseDto,
    description: 'User has been successfully authenticated',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['email must be a valid email'],
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.login(loginDto);

    const accessExpiration = this.parseDuration(
      this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
    );
    const refreshExpiration = this.parseDuration(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
    );

    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      expires: new Date(Date.now() + accessExpiration),
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      expires: new Date(Date.now() + refreshExpiration),
    });

    return { message: 'Login successful' };
  }

  @Post('logout')
  @AuthGuard()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Logs out the current user by clearing authentication cookies. Requires valid authentication.',
  })
  @ApiCookieAuth('access_token')
  @ApiOkResponse({
    type: LogoutResponseDto,
    description: 'User has been successfully logged out',
  })
  @ApiUnauthorizedResponse({
    description: 'Access token is missing, invalid, or expired',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Access token not found' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
    });

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
    });

    return { message: 'Logout successful' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh authentication tokens',
    description:
      'Refreshes the access token using the refresh token stored in cookies. Generates new access and refresh tokens.',
  })
  @ApiCookieAuth('refresh_token')
  @ApiOkResponse({
    type: RefreshResponseDto,
    description: 'Tokens have been successfully refreshed',
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token is missing, invalid, or expired',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Refresh token not found' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async refresh(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokens = await this.authService.refreshTokens(refreshToken);

    const accessExpiration = this.parseDuration(
      this.configService.get<string>('JWT_ACCESS_EXPIRATION'),
    );
    const refreshExpiration = this.parseDuration(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION'),
    );

    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      expires: new Date(Date.now() + accessExpiration),
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      expires: new Date(Date.now() + refreshExpiration),
    });

    return { message: 'Tokens refreshed successfully' };
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 1000 * 60;
      case 'h':
        return value * 1000 * 60 * 60;
      case 'd':
        return value * 1000 * 60 * 60 * 24;
      default:
        throw new Error(`Unsupported duration unit: ${unit}`);
    }
  }
}
