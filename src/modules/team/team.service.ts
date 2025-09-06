import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Team, TeamMember, Role } from '@prisma/client';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto, ownerId: number): Promise<Team> {
    const team = await this.prisma.team.create({
      data: {
        ...createTeamDto,
        members: {
          create: {
            userId: ownerId,
            role: Role.OWNER,
          },
        },
      },
    });

    return team;
  }

  async findAllForUser(userId: number): Promise<Team[]> {
    const teams = await this.prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });
    return teams;
  }

  async findTeamByIdForUser(teamId: number, userId: number): Promise<Team | null> {
    const team = await this.prisma.team.findFirst({
      where: {
        id: teamId,
        members: {
          some: {
            userId,
          },
        },
      },
    });

    if (!team) {
      throw new UnauthorizedException('You are not a member of this team');
    }

    return team;
  }

  async update(teamId: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    return this.prisma.team.update({
      where: { id: teamId },
      data: updateTeamDto,
    });
  }

  async remove(teamId: number, userId: number): Promise<void> {
    const member = await this.prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (!member || member.role !== Role.OWNER) {
      throw new UnauthorizedException('Only the owner can delete a team.');
    }
    await this.prisma.team.delete({ where: { id: teamId } });
  }

  async addMember(teamId: number, addTeamMemberDto: AddTeamMemberDto): Promise<TeamMember> {
    const { userId, role } = addTeamMemberDto;

    if (role === Role.OWNER) {
      throw new UnauthorizedException('Cannot assign owner role to another user.');
    }

    const existingMember = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this team');
    }

    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role,
      },
    });
  }

  async updateMemberRole(
    teamId: number,
    userId: number,
    updateTeamMemberDto: UpdateTeamMemberDto,
  ): Promise<TeamMember> {
    const { role } = updateTeamMemberDto;

    if (role === Role.OWNER) {
      throw new UnauthorizedException('Cannot assign owner role to another user.');
    }

    const memberToUpdate = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (!memberToUpdate) {
      throw new NotFoundException('Team member not found.');
    }

    if (memberToUpdate.role === Role.OWNER) {
      throw new UnauthorizedException('Cannot change the role of the team owner.');
    }

    return this.prisma.teamMember.update({
      where: { userId_teamId: { userId, teamId } },
      data: { role },
    });
  }

  async removeMember(teamId: number, userId: number): Promise<void> {
    const member = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });

    if (!member) {
      throw new NotFoundException('Team member not found.');
    }

    if (member.role === Role.OWNER) {
      throw new UnauthorizedException('Cannot remove the team owner.');
    }

    await this.prisma.teamMember.delete({
      where: { userId_teamId: { userId, teamId } },
    });
  }

  async getMembers(teamId: number): Promise<TeamMember[]> {
    const members = await this.prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return members;
  }

  async findTeamById(teamId: number): Promise<Team | null> {
    return this.prisma.team.findUnique({ where: { id: teamId } });
  }

  async getTeamMemberRole(userId: number, teamId: number): Promise<Role | null> {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
    return teamMember ? teamMember.role : null;
  }
}
