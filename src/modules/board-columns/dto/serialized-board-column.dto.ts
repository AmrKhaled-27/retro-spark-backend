import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SerializedBoardColumnDto {
  @ApiProperty({ description: 'The unique identifier of the column', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'The title of the column', example: 'To Do' })
  @Expose()
  title: string;

  @ApiProperty({ description: 'The ID of the board this column belongs to', example: 1 })
  @Expose()
  board_id: number;

  @ApiProperty({ description: 'Whether the column is active', example: true })
  @Expose()
  is_active: boolean;

  @ApiProperty({ description: 'The display order of the column', example: 0 })
  @Expose()
  index: number;
}
