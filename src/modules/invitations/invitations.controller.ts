import { Controller, Post, Body, UseGuards, Param, ParseIntPipe, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AuthGuard, JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../types/auth.types';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { SerializedInvitationDto } from './dto/serialized-invitation.dto';
import { ResponseDtoFor } from 'src/common/dtos/generic-response.dto';

@ApiTags('Invitations')
@Controller()
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @ApiOperation({ summary: 'Get all invitations for a team' })
  @ApiOkResponse({
    description: 'A list of all invitations for the team.',
    type: ResponseDtoFor({
      fields: ['data'],
      dataDto: [SerializedInvitationDto],
    }),
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCookieAuth('access_token')
  @AuthGuard()
  @Serialize(SerializedInvitationDto)
  @Get('invitations/teams/:teamId')
  findAllByTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.invitationsService.findAllByTeam(teamId, user.id);
  }

  @ApiOperation({ summary: 'Invite users to a team' })
  @ApiCreatedResponse({
    description: 'The invitations have been successfully sent.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiCookieAuth('access_token')
  @Roles(Role.OWNER, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('invitations/teams/:teamId')
  create(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() createInvitationDto: CreateInvitationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.invitationsService.create(createInvitationDto, user.id, teamId);
  }

  @ApiOperation({ summary: 'Resend an invitation' })
  @ApiOkResponse({ description: 'The invitation has been successfully resent.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiNotFoundResponse({ description: 'Invitation not found.' })
  @ApiCookieAuth('access_token')
  @Roles(Role.OWNER, Role.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post('invitations/:invitationId/resend')
  resend(@Param('invitationId') invitationId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.invitationsService.resend(invitationId, user.id);
  }

  @ApiOperation({ summary: 'Accept an invitation' })
  @ApiOkResponse({ description: 'The invitation has been successfully accepted.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiNotFoundResponse({ description: 'Invitation not found or already accepted/expired.' })
  @ApiCookieAuth('access_token')
  @UseGuards(JwtAuthGuard)
  @Post('invitations/accept/:hash')
  accept(@Param('hash') hash: string, @CurrentUser() user: AuthenticatedUser) {
    return this.invitationsService.accept(hash, user.id);
  }
}
