// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe, Logger } from '@nestjs/common';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { ConfigService } from '@nestjs/config';
// import { AppModule } from './app.module';

// async function bootstrap() {
  //   const logger = new Logger('Bootstrap');
  
  //   const app = await NestFactory.create(AppModule, {
    //     // Faqat eng muhim xatolarni qoldiramiz, qolganini middleware orqali ko'ramiz
    //     logger: ['error', 'warn', 'log'],
    //   });
    
    //   const configi = app.get(ConfigService);
    //   const port = configi.get<number>('PORT', 4045);
    
    //   // 1. Prefiks - ENG TEPADA
    // app.setGlobalPrefix('api/v1');
    
    // // 2. CORS - DARROV KEYIN
    // app.enableCors({
      //   origin: true,
      //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      //   credentials: true,
      // });
      
      // // 3. DEBUG Logger
      // app.use((req, res, next) => {
        //   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        //   next();
        // });
        
        // // 4. Swagger setup - useGlobalPrefix: true bo'lsa api/v1 ichida bo'ladi
        // const config = new DocumentBuilder()
        //   .setTitle('EduCRM')
        //   .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
        //   .build();
        
        // const document = SwaggerModule.createDocument(app, config);
        // SwaggerModule.setup('api/v1/docs', app, document, {
//   swaggerOptions: { persistAuthorization: true },
// }); 
  
//   // // 1. Prefiksni o'rnatamiz
//   // app.setGlobalPrefix('api/v1'); 

//   // // 2. ENG TEPADA: Har qanday so'rovni tutuvchi DEBUG Middleware
//   // // Bu kod hamma narsadan (Guard, Filter) oldin ishlaydi
//   // app.use((req, res, next) => {
  //   //   const fullUrl = `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`;
  //   //   console.log('------------------ [DEBUG REQUEST] ------------------');
  //   //   console.log(`URL: ${fullUrl}`);
  //   //   console.log(`OriginalUrl: ${req.originalUrl}`);
  //   //   console.log(`Headers: ${req.headers.authorization ? 'Token bor' : 'Token yo\'q'}`);
  //   //   console.log('-----------------------------------------------------');
  //   //   next();
  //   // });
  
  //   // // CORS
  //   // app.enableCors({
    //   //   origin: '*',
    //   //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    //   //   allowedHeaders: ['Content-Type', 'Authorization'],
    //   // });
    
    //   // // 4. Swagger Setup (Soddalashtirilgan va Prefiksdan tashqarida)
    //   // const configSwagger = new DocumentBuilder()
    //   //   .setTitle('EduCRM Test API')
    //   //   .setDescription('Diagnostika rejimi yoqilgan')
    //   //   .setVersion('1.0')
    //   //   .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    //   //   .build();
    
    //   // const document = SwaggerModule.createDocument(app, configSwagger);
    
    //   // // Swagger http://localhost:4045/api/docs manzilida ochilishi kerak
    //   // SwaggerModule.setup('api/docs', app, document, {
      //   //   swaggerOptions: { persistAuthorization: true },
      //   //   useGlobalPrefix: false, // Prefiksga (api/v1) qaramasdan ishlashi uchun
      //   // });
      
      //   // 5. Global Validation
      //   app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
      
      //   await app.listen(port);
      
      //   console.log(`\n🚀 Server ishga tushdi: http://localhost:${port}/api/v1`);
      //   console.log(`📖 Swagger UI (Test): http://localhost:${port}/api/docs\n`);
      // }
      
      // bootstrap();
      
      import { NestFactory, Reflector } from '@nestjs/core';
      import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
      import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
      import { ConfigService } from '@nestjs/config';
      import { AppModule } from './app.module';
      import { SwaggerTheme, SwaggerThemeName } from 'swagger-themes';
      
      async function bootstrap() {
        const logger = new Logger('Bootstrap');
        
        const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);
  
  // const nodeEnv = config.get<string>('NODE_ENV', 'development');
  /** production da ham Swagger: SWAGGER_ENABLED=true */
  // const swaggerEnabled =
  //   nodeEnv !== 'production' ||
  //   config.get<string>('SWAGGER_ENABLED', '') === 'true';

  // ─── Global prefix ─────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // // ─── CORS ──────────────────────────────────────────────────────
  // app.enableCors({
  //   origin: config.get<string>('CORS_ORIGIN', '*'),
  //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  //   credentials: true,
  // });

  // // ─── Global Validation Pipe ─────────────────────────────────────
  // // whitelist: strips unknown properties automatically
  // // transform: converts query strings to proper types (string → number, etc.)
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: false,
  //     transform: true,
  //     transformOptions: {
  //       enableImplicitConversion: true,
  //     },
  //     stopAtFirstError: false,
  //   }),
  // );


  // Class serializer (respects @Exclude decorators)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // ─── Swagger (only in non-production) ──────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('EduCRM API')
    .setDescription(
      'Ta\'lim markazi CRM tizimi — NestJS + TypeORM + PostgreSQL\n\n' +
      '**Asosiy URL:** barcha endpointlar ` /api/v1 ` prefiksi ostida.\n\n' +
      '**Foydalanish:** `POST /api/v1/auth/login` dan token oling, ' +
      'Swagger UI da **Authorize** tugmasini bosing va `Bearer <accessToken>` kiriting.\n\n' +
      'DTO maydonlari `class-validator` + `@ApiProperty` bilan hujjatlangan.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header', },
      'JWT',
    )
    .addTag('Auth', 'Tizimga kirish va token boshqaruvi')
    .addTag('Users', 'Foydalanuvchilar (admin only)')
    .addTag('Branches', 'Filiallar')
    .addTag('Courses', 'Kurslar')
    .addTag('Students', 'O\'quvchilar')
    .addTag('Teachers', 'O\'qituvchilar')
    .addTag('Groups', 'Guruhlar')
    .addTag('Payments', 'To\'lovlar, qarzlar va maoshlar')
    .addTag('Attendance', 'Davomat')
    .addTag('Leads (CRM Pipeline)', 'Leadlar va CRM voronkasi')
    .build();

const theme = new SwaggerTheme(); // Versiyani yozmasa ham bo'ladi
const document = SwaggerModule.createDocument(app, swaggerConfig);

SwaggerModule.setup('api/v1/docs', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  },
  // DIQQAT: customCss swaggerOptions ichida EMAS, tashqarisida bo'ladi
  customCss: theme.getBuffer('dark' as SwaggerThemeName), 
});

  await app.listen(port);
  logger.log(`🚀 EduCRM server ishga tushdi: http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger docs:              http://localhost:${port}/api/v1/docs\n`);
  // logger.log(`🌍 Muhit: ${nodeEnv}`);
}

bootstrap();