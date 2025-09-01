import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TeamService } from '../../modules/team/team.service';

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
    const teamId = parseInt(request.params.id, 10);

    if (!user || !teamId) {
      return false;
    }

    const team = await this.teamService.findTeamById(teamId);
    if (!team) {
      return false;
    }

    if (team.ownerId === user.id) {
      return true; // Owner has all permissions
    }

    const userRole = await this.teamService.getTeamMemberRole(user.id, teamId);
    if (!userRole) {
      return false;
    }

    return roles.includes(userRole);
  }
}
