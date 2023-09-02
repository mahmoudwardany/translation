/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { TranslationEntity } from '../entities/translation.entity';

@Injectable()
export class TranslationsService {
  private readonly googleTranslateUrl =
    'https://google-translate1.p.rapidapi.com/language/translate/v2';
  private readonly microsoftTranslateUrl =
    'https://microsoft-translator-text.p.rapidapi.com/translate';

  constructor(
    @InjectRepository(TranslationEntity)
    private readonly translationRepository: Repository<TranslationEntity>,
    private readonly configService: ConfigService,
  ) {}

  async translateText(
    userId: number,
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    const googleApiKey = this.configService.get('API_KEY');
    const microsoftApiKey = this.configService.get('API_KEY');

    const googleTranslatedText = await this.translateWithProvider(
      this.googleTranslateUrl,
      googleApiKey,
      text,
      sourceLanguage,
      targetLanguage,
      userId,
      'Google',
    );

    if (googleTranslatedText !== 'Translation failed') {
      return googleTranslatedText;
    }

    const microsoftTranslatedText = await this.translateWithProvider(
      this.microsoftTranslateUrl,
      microsoftApiKey,
      text,
      sourceLanguage,
      targetLanguage,
      userId,
      'Microsoft',
    );

    if (microsoftTranslatedText !== 'Translation failed') {
      return microsoftTranslatedText;
    }

    return 'Translation failed';
  }

  private async translateWithProvider(
    apiUrl: string,
    apiKey: string,
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    userId: number,
    engine: string,
  ): Promise<string> {
    try {
      const response = await axios({
        method: 'post',
        url: apiUrl,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          'Accept-Encoding': 'application/gzip',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host':
            apiUrl === this.googleTranslateUrl
              ? 'google-translate1.p.rapidapi.com'
              : 'microsoft-translator-text.p.rapidapi.com',
        },
        data: `q=${encodeURIComponent(
          text,
        )}&target=${targetLanguage}&source=${sourceLanguage}`,
      });

      const translation = response.data.data.translations[0].translatedText;

      if (translation !== 'Translation failed') {
        await this.saveTranslation(
          userId,
          text,
          translation,
          sourceLanguage,
          targetLanguage,
          engine,
        );
      }

      return translation;
    } catch (error) {
      return 'Translation failed';
    }
  }

  async saveTranslation(
    userId: number,
    text: string,
    translation: string,
    sourceLanguage: string,
    targetLanguage: string,
    engine: string,
  ): Promise<void> {
    const newTranslation = this.translationRepository.create({
      user: { id: userId },
      text,
      translation,
      sourceLanguage,
      targetLanguage,
      engine,
    });

    try {
      await this.translationRepository.save(newTranslation);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getTranslationHistory(
    userId: number,
    page: number,
    limit: number,
  ): Promise<TranslationEntity[]> {
    const skip = (page - 1) * limit;

    return this.translationRepository
      .createQueryBuilder('translation')
      .where('translation.user.id = :userId', { userId })
      .orderBy('translation.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();
  }
}
