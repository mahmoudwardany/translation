import { IsNotEmpty, IsString } from 'class-validator';

export class TranslationRequestDto {
  @IsNotEmpty({ message: 'text is required' })
  @IsString({ message: 'text must be string' })
  text: string;

  @IsNotEmpty({ message: 'sourceLanguage is required' })
  @IsString({ message: 'sourceLanguage must be string' })
  sourceLanguage: string;

  @IsNotEmpty({ message: 'targetLanguage is required' })
  @IsString({ message: 'targetLanguage must be string' })
  targetLanguage: string;
}
