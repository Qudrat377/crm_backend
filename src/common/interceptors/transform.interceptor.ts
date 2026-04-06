import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        message: data?.message || 'Success',
        data: (data?.data !== undefined && data?.total === undefined) ? data.data : data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { map } from 'rxjs/operators';

// export interface ApiResponse<T> {
//   success: boolean;
//   data: T;
//   timestamp: string;
// }

// @Injectable()
// export class TransformInterceptor<T>
//   implements NestInterceptor<T, ApiResponse<T>>
// {
//     intercept(
//     context: ExecutionContext,
//     next: CallHandler,
//   ): Observable<any> {
//     const request = context.switchToHttp().getRequest();
//     const url = request?.url || '';

//     // E'TIBOR BERING: Swagger yo'llarini chetlab o'tish (ignore):
//     if (url.includes('api/docs') || url.includes('swagger-ui')) {
//       return next.handle();
//     }

//     return next.handle().pipe(
//       map((data) => ({
//         success: true,
//         data,
//         timestamp: new Date().toISOString(),
//       })),
//     );
//   }
// }
