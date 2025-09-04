import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamDto {
  @ApiProperty({
    description: 'The new title of the team',
    example: 'My Updated Team',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'The new description of the team',
    example: 'An updated description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
