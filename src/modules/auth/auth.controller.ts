import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.signUp(signUpDto);

    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });

    return { message: 'Signup successful' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.login(loginDto);

    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });

    return { message: 'Login successful' };
  }
}
