import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateTeamMemberDto {
  @ApiProperty({
    description: 'The new role of the user in the team',
    enum: Role,
    example: Role.FACILITATOR,
  })
  @IsEnum(Role)
  role: Role;
}
