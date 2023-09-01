/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TranslationModule } from './translation/translation.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmCOnfig } from './config/db.config';
import { HttpModule } from '@nestjs/axios'; 
import { ThrottlerModule } from '@nestjs/throttler';
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
export class AppModule {}
