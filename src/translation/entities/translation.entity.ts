/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity({ name: 'translation' })
export class TranslationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  translation: string;

  @Column()
  sourceLanguage: string;

  @Column()
  targetLanguage: string;

  @Column({ default: 'Google' })
  engine: string;
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @ManyToOne(() => UserEntity, (user) => user.translations)
  user: UserEntity;
  @Column()
  userId: number;
}
