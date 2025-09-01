import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ description: 'The title of the team', example: 'My Awesome Team' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The description of the team',
    example: 'A team for awesome people',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
