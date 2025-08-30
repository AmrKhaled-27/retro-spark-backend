import { Type } from '@nestjs/common';
import { ApiExtraModels, ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';

export class ResponseDto<T, M = Record<string, any>> {
  @ApiPropertyOptional({
    description: 'Response message',
    example: 'Operation completed successfully',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Response data',
  })
  data?: T;

  @ApiPropertyOptional({
    description: 'Response metadata',
  })
  meta?: M;

  @ApiPropertyOptional({
    description: 'Error details',
    type: [String],
  })
  errors?: string[];
}

export interface ResponseDtoForOptions<T, M> {
  fields: (keyof ResponseDto<T, M>)[];
  dataDto?: Type<T>;
  metaDto?: Type<M>;
  messageExample?: string;
}

export function ResponseDtoFor<T = any, M = any>(options: ResponseDtoForOptions<T, M>): any {
  const { fields, dataDto, metaDto, messageExample } = options;

  // Create a unique class name for Swagger
  const dataModelName = dataDto?.name || 'GenericData';
  const metaModelName = metaDto?.name || 'GenericMeta';
  const fieldsStr = fields.sort().join('');
  const className = `ResponseFor${fieldsStr}${dataModelName}${metaModelName}`;

  // Cache created classes to avoid re-creating them
  if ((global as any)[className]) {
    return (global as any)[className];
  }

  const extraModels = [];
  if (dataDto) extraModels.push(dataDto);
  if (metaDto) extraModels.push(metaDto);

  @ApiExtraModels(...extraModels)
  class DynamicResponseDto extends PickType(ResponseDto<T, M>, fields as any) {}

  if (fields.includes('data') && dataDto) {
    ApiProperty({
      description: 'Response data',
      type: dataDto,
    })(DynamicResponseDto.prototype, 'data');
  }

  if (fields.includes('meta') && metaDto) {
    ApiProperty({
      description: 'Response metadata',
      type: metaDto,
    })(DynamicResponseDto.prototype, 'meta');
  }

  if (fields.includes('message') && messageExample) {
    ApiPropertyOptional({
      description: 'Response message',
      example: messageExample,
    })(DynamicResponseDto.prototype, 'message');
  }

  Object.defineProperty(DynamicResponseDto, 'name', { value: className });

  // Store in a global cache to avoid re-creation
  (global as any)[className] = DynamicResponseDto;

  return DynamicResponseDto;
}
