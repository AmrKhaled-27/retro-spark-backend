import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus } from '@prisma/client';

export class SerializedInvitationDto {
  @ApiProperty({ description: 'The unique identifier of the invitation' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'The email of the invited user' })
  @Expose()
  invitedEmail: string;

  @ApiProperty({ description: 'The status of the invitation', enum: InvitationStatus })
  @Expose()
  status: InvitationStatus;
}
