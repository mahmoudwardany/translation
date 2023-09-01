/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { TranslationEntity } from '../entities/translation.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TranslationsService {
  constructor(
    @InjectRepository(TranslationEntity)
    private readonly translationRepository: Repository<TranslationEntity>,
    private readonly configService: ConfigService,
  ) {}

  //translate text by google (default)
  async translateText(
    userId: number,
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    const googleApiKey = this.configService.get('API_KEY');
    const microsoftApiKey = this.configService.get('API_KEY');
    const googleTranslateUrl =
      'https://google-translate1.p.rapidapi.com/language/translate/v2';
    const microsoftTranslateUrl =
      'https://microsoft-translator-text.p.rapidapi.com/translate';
    try {
      const googleTranslatedText = await this.translateWithGoogle(
        googleTranslateUrl,
        googleApiKey,
        text,
        sourceLanguage,
        targetLanguage,
      );
      //Save google history if everything ok
      if (googleTranslatedText !== 'Translation failed') {
        await this.saveTranslation(
          userId,
          text,
          googleTranslatedText,
          sourceLanguage,
          targetLanguage,
          'Google',
        );
        return googleTranslatedText;
      }

      // Use Microsoft Translate if Google Translate failed and save the translation
      const microsoftTranslatedText = await this.translateWithMicrosoft(
        microsoftTranslateUrl,
        microsoftApiKey,
        text,
        sourceLanguage,
        targetLanguage,
      );
      if (microsoftTranslatedText !== 'Translation failed') {
        await this.saveTranslation(
          userId,
          text,
          microsoftTranslatedText,
          sourceLanguage,
          targetLanguage,
          'Microsoft',
        );
        return microsoftTranslatedText;
      }
    } catch (error) {
      return error;
    }
  }
  //Connect with google translate Api
  async translateWithGoogle(
    url: string,
    apiKey: string,
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    try {
      const response = await axios({
        method: 'post',
        url,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          'Accept-Encoding': 'application/gzip',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com',
        },
        data: `q=${encodeURIComponent(
          text,
        )}&target=${targetLanguage}&source=${sourceLanguage}`,
      });
      const translation = response.data.data.translations[0].translatedText;
      return translation;
    } catch (error) {
      return error;
    }
  }
  //Micro Soft connection
  async translateWithMicrosoft(
    url: string,
    apiKey: string,
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    try {
      const response = await axios({
        method: 'post',
        url,
        params: {
          'from[0]': sourceLanguage,
          'to[0]': targetLanguage,
          'api-version': '3.0',
          profanityAction: 'NoAction',
          textType: 'plain',
        },
        headers: {
          'Content-type': 'application/json',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com',
        },
        data: {
          text,
        },
      });
      return response.data[0].translations[0].text;
    } catch (error) {
      return 'Translation failed';
    }
  }
  //save translation
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
  //Get Translation History for User
  async getTranslationHistory(
    userId: number,
    page: number,
    limit: number,
  ): Promise<TranslationEntity[]> {
    const skip = (page - 1) * limit;

    return this.translationRepository
      .createQueryBuilder('translation')
      .where('translation.user.id = :userId', { userId })
      .orderBy('translation.id', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();
  }
}
