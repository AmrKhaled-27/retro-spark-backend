import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../types/auth.types';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { Serialize } from '../../common/interceptors/serialize.interceptor';
import { ResponseDtoFor } from '../../common/dtos/generic-response.dto';
import { SerializedTeamDto } from './dto/serialized-team.dto';
import { SerializedTeamMemberDto } from './dto/serialized-team-member.dto';

@ApiTags('Teams')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @ApiOperation({ summary: 'Create a new team' })
  @ApiCreatedResponse({
    type: ResponseDtoFor({
      fields: ['data'],
      dataDto: SerializedTeamDto,
    }),
    description: 'The team has been successfully created.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Unauthorized.',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Serialize(SerializedTeamDto)
  @Post()
  create(@Body() createTeamDto: CreateTeamDto, @CurrentUser() user: AuthenticatedUser) {
    return this.teamService.create(createTeamDto, user.id);
  }

  @ApiOperation({ summary: 'Get all teams where the authenticated user is a member' })
  @ApiOkResponse({
    type: ResponseDtoFor({
      fields: ['data'],
      dataDto: [SerializedTeamDto],
    }),
    description: 'List of teams.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Unauthorized.',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Serialize(SerializedTeamDto)
  @Get()
  findAllForUser(@CurrentUser() user: AuthenticatedUser) {
    return this.teamService.findAllForUser(user.id);
  }

  @ApiOperation({ summary: 'Get details of a specific team (only if user is a member)' })
  @ApiOkResponse({
    type: ResponseDtoFor({
      fields: ['data'],
      dataDto: SerializedTeamDto,
    }),
    description: 'Team details.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Forbidden.',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Serialize(SerializedTeamDto)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.teamService.findTeamByIdForUser(+id, user.id);
  }

  @ApiOperation({ summary: 'Update team details (admins/owner only)' })
  @ApiOkResponse({
    type: ResponseDtoFor({
      fields: ['data'],
      dataDto: SerializedTeamDto,
    }),
    description: 'The team has been successfully updated.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Forbidden.',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Serialize(SerializedTeamDto)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamService.update(+id, updateTeamDto);
  }

  @ApiOperation({ summary: 'Delete team (owner only)' })
  @ApiNoContentResponse({ description: 'The team has been successfully deleted.' })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Forbidden.',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.teamService.remove(+id, user.id);
  }

  @ApiOperation({ summary: 'Add a member to the team (admin/owner only)' })
  @ApiCreatedResponse({
    type: ResponseDtoFor({
      fields: ['data'],
      dataDto: SerializedTeamMemberDto,
    }),
    description: 'The member has been successfully added.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Forbidden.',
  })
  @ApiConflictResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Conflict - User is already a member.',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Serialize(SerializedTeamMemberDto)
  @Post(':id/members')
  addMember(@Param('id') id: string, @Body() addTeamMemberDto: AddTeamMemberDto) {
    return this.teamService.addMember(+id, addTeamMemberDto);
  }

  @ApiOperation({ summary: 'Change role of a member (admin/owner only, cannot modify owner)' })
  @ApiOkResponse({
    type: ResponseDtoFor({
      fields: ['data'],
      dataDto: SerializedTeamMemberDto,
    }),
    description: 'The member role has been successfully updated.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Forbidden.',
  })
  @ApiNotFoundResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Not Found - Team member not found.',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Serialize(SerializedTeamMemberDto)
  @Patch(':id/members/:userId')
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
  ) {
    return this.teamService.updateMemberRole(+id, +userId, updateTeamMemberDto);
  }

  @ApiOperation({
    summary: 'Remove a member from the team (admin/owner only, cannot remove owner)',
  })
  @ApiNoContentResponse({ description: 'The member has been successfully removed.' })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Forbidden.',
  })
  @ApiNotFoundResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Not Found - Team member not found.',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/members/:userId')
  @HttpCode(204)
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.teamService.removeMember(+id, +userId);
  }

  @ApiOperation({ summary: 'List all members of a team' })
  @ApiOkResponse({
    type: ResponseDtoFor({
      fields: ['data'],
      dataDto: [SerializedTeamMemberDto],
    }),
    description: 'List of team members.',
  })
  @ApiUnauthorizedResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Unauthorized.',
  })
  @ApiForbiddenResponse({
    type: ResponseDtoFor({
      fields: ['errors'],
    }),
    description: 'Forbidden.',
  })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.FACILITATOR, Role.PARTICIPANT)
  @Serialize(SerializedTeamMemberDto)
  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.teamService.getMembers(+id);
  }
}
