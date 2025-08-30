import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../types/api-response.types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((responseData) => {
        let message: string | undefined;
        let meta: any | undefined;
        let data = responseData;

        if (responseData && typeof responseData === 'object') {
          // Extract message if it exists
          if ('message' in responseData) {
            message = responseData.message as string;
          }

          // Extract meta if it exists
          if ('meta' in responseData) {
            meta = responseData.meta;
          }

          // Remove message and meta from the original data to put the rest in data
          if ('message' in responseData || 'meta' in responseData) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { message: _, meta: __, ...rest } = responseData as any;
            data = Object.keys(rest).length > 0 ? rest : null;
          }
        }

        return {
          ...(data !== null && { data }),
          ...(message !== undefined && { message }),
          ...(meta !== undefined && { meta }),
        };
      }),
    );
  }
}
