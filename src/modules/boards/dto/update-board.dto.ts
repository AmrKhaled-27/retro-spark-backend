import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { BoardType } from '@prisma/client';
import { CreateBoardDto } from './create-board.dto';

export class UpdateBoardDto extends PartialType(OmitType(CreateBoardDto, [] as const)) {
  @ApiProperty({
    description: 'The title of the board',
    example: 'Updated Sprint Retrospective',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'The description of the board',
    example: 'A board for our team to collaborate.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The type of the board',
    enum: BoardType,
    example: BoardType.PRIVATE,
    required: false,
  })
  @IsEnum(BoardType)
  @IsOptional()
  type?: BoardType;

  @ApiProperty({
    description: 'Whether the board is anonymous',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_anonymous?: boolean;
}
