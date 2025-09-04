import { IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class AddTeamMemberDto {
  @ApiProperty({ description: 'The ID of the user to add to the team', example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'The role of the user in the team',
    enum: Role,
    example: Role.PARTICIPANT,
  })
  @IsEnum(Role)
  role: Role;
}
