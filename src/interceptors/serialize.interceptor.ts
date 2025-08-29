import { UseInterceptors, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

interface ClassConstructor {
  new (...args: any[]): object;
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) => {
        // Extract message and meta before serialization to preserve them
        let message: string | undefined;
        let meta: any | undefined;

        if (data && typeof data === 'object') {
          message = data.message;
          meta = data.meta;
        }

        // Serialize the data
        const serializedData = plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });

        // Always include message and meta in the result, even if they're undefined
        return {
          ...serializedData,
          ...(message !== undefined && { message }),
          ...(meta !== undefined && { meta }),
        };
      }),
    );
  }
}
