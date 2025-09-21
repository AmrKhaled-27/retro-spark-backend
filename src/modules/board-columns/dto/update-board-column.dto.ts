import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateBoardColumnDto {
  @ApiPropertyOptional({ description: 'The title of the column', example: 'In Progress' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Whether the column is active', example: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'The display order of the column', example: 1 })
  @IsInt()
  @IsOptional()
  index?: number;
}
