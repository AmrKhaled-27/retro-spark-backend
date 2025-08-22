import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SerializedUserDto {
  @Expose()
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 1,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name: string;
}
