import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SerializedTeamDto {
  @ApiProperty({ description: 'The unique identifier of the team', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'The title of the team', example: 'My Awesome Team' })
  @Expose()
  title: string;

  @ApiProperty({ description: 'The description of the team', example: 'A team for awesome people' })
  @Expose()
  description: string;
}
