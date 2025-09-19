import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus } from '@prisma/client';
import { SerializedUserDto } from 'src/modules/user/dto/serialized-user.dto';

export class SerializedInvitationDto {
  @ApiProperty({ description: 'The unique identifier of the invitation' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The email of the invited user' })
  @Expose()
  invitedEmail: string;

  @ApiProperty({ description: 'The ID of the team the invitation is for' })
  @Expose()
  @Type(() => SerializedUserDto)
  invitedBy: SerializedUserDto;

  @ApiProperty({ description: 'The status of the invitation', enum: InvitationStatus })
  @Expose()
  status: InvitationStatus;
}
