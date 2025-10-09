import { Controller, Get } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/types/auth.types';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { SerializedUserDto } from './dto/serialized-user.dto';
import { ResponseDtoFor } from '../../common/dtos/generic-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('Users')
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
    type: ResponseDtoFor({
      fields: ['data'],
      dataDto: SerializedUserDto,
    }),
    description: 'User profile retrieved successfully',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Access token is missing, invalid, or expired',
  })
  @ApiForbiddenResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'User does not have permission to access this resource',
  })
  @ApiNotFoundResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'User not found in database',
  })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.findById(user.id);
  }
}
