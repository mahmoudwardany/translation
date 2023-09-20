/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TranslationModule } from './translation/translation.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmCOnfig } from './config/db.config';
import { HttpModule } from '@nestjs/axios'; 
import { ThrottlerModule } from '@nestjs/throttler';
import { CompressionMiddleware } from './util/compression.middleware';
@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot(typeOrmCOnfig),
    TranslationModule,
    HttpModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CompressionMiddleware).forRoutes('*');
  }
}
