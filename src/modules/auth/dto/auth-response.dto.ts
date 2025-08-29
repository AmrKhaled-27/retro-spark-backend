import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Success message indicating the result of the authentication operation',
    example: 'Operation successful',
  })
  message: string;
}

export class SignupResponseDto {
  @ApiProperty({
    description: 'Success message for user registration',
    example: 'Signup successful',
  })
  message: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Success message for user login',
    example: 'Login successful',
  })
  message: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Success message for user logout',
    example: 'Logout successful',
  })
  message: string;
}

export class RefreshResponseDto {
  @ApiProperty({
    description: 'Success message for token refresh',
    example: 'Tokens refreshed successfully',
  })
  message: string;
}
