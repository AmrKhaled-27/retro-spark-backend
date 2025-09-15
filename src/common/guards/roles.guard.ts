import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TeamService } from '../../modules/team/team.service';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly teamService: TeamService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const teamId = parseInt(request.params.teamId, 10) || parseInt(request.body.teamId, 10);

    if (!user || !teamId) {
      return false;
    }

    const userRole = await this.teamService.getTeamMemberRole(user.id, teamId);
    if (!userRole) {
      return false;
    }

    if (userRole === Role.OWNER) {
      return true; // Owner has all permissions
    }

    return roles.includes(userRole);
  }
}
