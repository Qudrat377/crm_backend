import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Database
import { DatabaseModule } from './database/database.module';

// Common
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BranchesModule } from './modules/branches/branches.module';
import { CoursesModule } from './modules/courses/courses.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { GroupsModule } from './modules/groups/groups.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeadsModule } from './modules/leads/leads.module';

@Module({
  imports: [
    // Config: globally available in all modules, reads from .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database: TypeORM + PostgreSQL
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    BranchesModule,
    CoursesModule,
    StudentsModule,
    TeachersModule,
    GroupsModule,
    PaymentsModule,
    AttendanceModule,
    LeadsModule,
  ],
  providers: [
    // ─── Global exception filter ──────────────────────────────────
    // Catches ALL unhandled exceptions (HTTP, TypeORM QueryFailedError, etc.)
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    
    

    // ─── Global guards (applied to every route) ───────────────────
    // JwtAuthGuard: checks Bearer token unless route has @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },



    // RolesGuard: checks @Roles() decorator
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // ─── Global interceptors ──────────────────────────────────────
    // Logs every request with duration and user context
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Wraps all responses: { success: true, data: ..., timestamp: ... }
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
