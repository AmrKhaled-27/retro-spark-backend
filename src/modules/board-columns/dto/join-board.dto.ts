import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class JoinBoardDto {
  @ApiProperty({
    description: 'The id of the board to get columns for.',
    example: 1,
  })
  @IsInt()
  boardId: number;
}
