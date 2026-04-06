import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Ichki server xatosi';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message ?? exception.message;
        error = (res as any).error ?? exception.name;
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else if (exception instanceof QueryFailedError) {
      // PostgreSQL unique violation
      if ((exception as any).code === '23505') {
        status = HttpStatus.CONFLICT;
        message = this.extractUniqueViolationMessage(exception);
        error = 'Conflict';
      }
      // PostgreSQL foreign key violation
      else if ((exception as any).code === '23503') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Bog\'liq yozuv topilmadi (foreign key violation)';
        error = 'Bad Request';
      }
      // PostgreSQL not null violation
      else if ((exception as any).code === '23502') {
        status = HttpStatus.BAD_REQUEST;
        message = `Majburiy maydon bo\'sh: ${(exception as any).column}`;
        error = 'Bad Request';
      } else {
        this.logger.error('QueryFailedError', exception);
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Yozuv topilmadi';
      error = 'Not Found';
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }

  private extractUniqueViolationMessage(exception: QueryFailedError): string {
    const detail = (exception as any).detail as string;
    if (detail?.includes('email')) return 'Bu email allaqachon ro\'yxatdan o\'tgan';
    if (detail?.includes('phone')) return 'Bu telefon raqam allaqachon mavjud';
    if (detail?.includes('group_students'))
      return 'O\'quvchi bu guruhga allaqachon qo\'shilgan';
    if (detail?.includes('debt'))
      return 'Bu oy uchun qarz yozuvi allaqachon mavjud';
    if (detail?.includes('salary_records'))
      return 'Bu oy uchun maosh yozuvi allaqachon mavjud';
    if (detail?.includes('attendance'))
      return 'Bu sana uchun davomat allaqachon belgilangan';
    return 'Bu qiymat allaqachon mavjud';
  }
}
