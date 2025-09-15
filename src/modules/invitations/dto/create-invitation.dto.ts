import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'A comma-separated string of emails to invite',
    example: 'user1@example.com,user2@example.com',
  })
  @IsString()
  @IsNotEmpty()
  emails: string;
}
