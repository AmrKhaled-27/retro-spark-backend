import { Controller, Get } from '@nestjs/common';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/types/auth.types';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { SerializedUserDto } from './dto/serialized-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @Serialize(SerializedUserDto)
  @AuthGuard()
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Returns the profile information of the currently authenticated user. Requires authentication via HTTP-only cookies.',
  })
  @ApiCookieAuth('access_token')
  @ApiOkResponse({
    type: SerializedUserDto,
    description: 'User profile retrieved successfully',
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
  @ApiForbiddenResponse({
    description: 'User does not have permission to access this resource',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'Forbidden resource' },
        error: { type: 'string', example: 'Forbidden' },
      },
    },
  })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.findById(user.id);
  }
}
