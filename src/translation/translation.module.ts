import { Module } from '@nestjs/common';
import { TranslationController } from './controller/translation.controller';
import { TranslationsService } from './services/translation.service';
import { TranslationEntity } from './entities/translation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([TranslationEntity]),
    UserModule,
    ConfigModule,
  ],
  controllers: [TranslationController],
  providers: [TranslationsService],
})
export class TranslationModule {}
