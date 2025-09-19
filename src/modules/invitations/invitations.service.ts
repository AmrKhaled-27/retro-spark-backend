import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TeamService } from '../team/team.service';
import { MailerService } from '@nestjs-modules/mailer';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationStatus, Role } from '@prisma/client';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teamService: TeamService,
    private readonly mailerService: MailerService,
  ) {}

  async create(createInvitationDto: CreateInvitationDto, invitedById: number, teamId: number) {
    const { emails } = createInvitationDto;
    const team = await this.teamService.findTeamById(teamId);

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const emailList = emails.split(',').map((email) => email.trim());
    const invitedEmails = [];
    const invalidEmails = [];

    for (const email of emailList) {
      // Basic email validation
      if (!this.validateEmail(email)) {
        invalidEmails.push(email);
        continue;
      }

      const invitation = await this.prisma.invitation.upsert({
        where: { teamId_invitedEmail: { teamId: +teamId, invitedEmail: email } },
        update: { invitedById: invitedById },
        create: {
          teamId: teamId,
          invitedEmail: email,
          invitedById: invitedById,
        },
      });

      await this.sendInvitationEmail(email, team.title, invitation.id);
      invitedEmails.push(email);
    }

    return { invitedEmails, invalidEmails };
  }

  async resend(invitationId: string, userId: number) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { team: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const memberRole = await this.teamService.getTeamMemberRole(userId, invitation.teamId);
    if (memberRole !== Role.ADMIN && memberRole !== Role.OWNER) {
      throw new UnauthorizedException('Only admins or owners can resend invitations.');
    }

    if (invitation.status === 'PENDING') {
      await this.sendInvitationEmail(invitation.invitedEmail, invitation.team.title, invitation.id);
      await this.prisma.invitation.update({
        where: { id: invitationId },
        data: { updatedAt: new Date() },
      });
    }

    return { message: 'Invitation resent successfully' };
  }

  async accept(hash: string, userId: number) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id: hash } });

    if (!invitation || invitation.status !== InvitationStatus.PENDING) {
      throw new NotFoundException('Invitation not found or already accepted.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user.email.toLowerCase() !== invitation.invitedEmail.toLowerCase()) {
      throw new UnauthorizedException("The email in the invitation doesn't match yours.");
    }

    await this.teamService.addMember(invitation.teamId, { userId, role: Role.PARTICIPANT });

    await this.prisma.invitation.update({
      where: { id: hash },
      data: { status: InvitationStatus.ACCEPTED },
    });

    return { message: 'Invitation accepted successfully.' };
  }

  async findAllByTeam(teamId: number, userId: number) {
    const memberRole = await this.teamService.getTeamMemberRole(userId, teamId);

    if (!memberRole) {
      throw new UnauthorizedException('You are not a member of this team.');
    }

    return await this.prisma.invitation.findMany({
      where: {
        teamId,
        status: {
          not: InvitationStatus.ACCEPTED,
        },
      },
      select: {
        id: true,
        status: true,
        invitedEmail: true,
        createdAt: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async sendInvitationEmail(email: string, teamName: string, invitationId: string) {
    const invitationLink = `${process.env.FRONTEND_URL}/app/invitation?invitationId=${invitationId}`;
    await this.mailerService.sendMail({
      to: email,
      subject: `You have been invited to join the team: ${teamName}`,
      template: 'invitation',
      context: {
        teamName,
        invitationLink,
        year: new Date().getFullYear(),
      },
    });
  }

  private validateEmail(email: string) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
}
