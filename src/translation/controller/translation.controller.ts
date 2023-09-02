/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TranslationsService } from '../services/translation.service';
import { GetUser } from '../../util/get-user.decorator';
import { UserEntity } from '../../user/entities/user.entity';
import { TranslationEntity } from '../entities/translation.entity';
import { TranslationRequestDto } from '../dto/create-translation.dto';

@Controller('translation')
@UseGuards(AuthGuard())
export class TranslationController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Post()
  async translate(
    @GetUser() user: UserEntity,
    @Body() translationData: TranslationRequestDto,
  ) {
    const { text, sourceLanguage, targetLanguage } = translationData;
    const translatedText = await this.translationsService.translateText(
      user.id,
      text,
      sourceLanguage,
      targetLanguage,
    );

    return { translatedText };
  }

  @Get('history')
  getTranslationHistory(
    @GetUser() user: UserEntity,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<TranslationEntity[]> {
    const userId = user.id;

    return this.translationsService.getTranslationHistory(userId, page, limit);
  }
}
