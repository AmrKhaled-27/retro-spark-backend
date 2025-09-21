import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { BoardType } from '@prisma/client';

export class CreateBoardDto {
  @ApiProperty({
    description: 'The title of the board',
    example: 'Sprint Retrospective',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The description of the board',
    example: 'A board for the sprint retrospective',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The type of the board',
    enum: BoardType,
    example: BoardType.PUBLIC,
  })
  @IsEnum(BoardType)
  type: BoardType;
}
