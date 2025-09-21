import { ApiProperty } from '@nestjs/swagger';
import { BoardType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class SerializedBoardDto {
  @Expose()
  @ApiProperty({ description: 'Board ID', example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ description: 'Board title', example: 'New Board' })
  title: string;

  @Expose()
  @ApiProperty({
    description: 'Board description',
    example: 'A board for our team to collaborate.',
  })
  description: string;

  @Expose()
  @ApiProperty({
    description: 'Board type',
    enum: BoardType,
    example: BoardType.PUBLIC,
  })
  type: BoardType;

  @Expose()
  @ApiProperty({ description: 'Team ID', example: 1 })
  teamId: number;

  @Expose()
  @ApiProperty({ description: 'Is anonymous', example: false })
  is_anonymous: boolean;
}
