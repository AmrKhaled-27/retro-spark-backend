import { Controller, Get } from '@nestjs/common';
import { AuthGuard } from 'src/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/types/auth.types';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { SerializedUserDto } from './dto/serialized-user.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @Serialize(SerializedUserDto)
  @AuthGuard()
  @ApiOkResponse({
    type: SerializedUserDto,
    description: 'The authenticated user details',
  })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.userService.findById(user.id);
  }
}
