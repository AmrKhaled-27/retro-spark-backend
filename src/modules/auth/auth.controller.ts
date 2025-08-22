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
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User signup' })
  @ApiResponse({ status: 201, description: 'User has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
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
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User has been successfully logged in.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
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
  @ApiBearerAuth()
  @AuthGuard()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'User has been successfully logged out.' })
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
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens have been successfully refreshed.' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
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
