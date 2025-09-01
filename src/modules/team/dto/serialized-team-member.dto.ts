import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { SerializedUserDto } from '../../user/dto/serialized-user.dto';

export class SerializedTeamMemberDto {
  @ApiProperty({ description: 'The user object', type: SerializedUserDto })
  @Type(() => SerializedUserDto)
  @Expose()
  user: SerializedUserDto;

  @ApiProperty({
    description: 'The role of the user in the team',
    enum: Role,
    example: Role.PARTICIPANT,
  })
  @Expose()
  role: Role;
}

export class SerializedTeamMembersDto {
  @ApiProperty({ description: 'List of team members', type: [SerializedTeamMemberDto] })
  @Expose()
  members: SerializedTeamMemberDto[];
}
