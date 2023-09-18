/* eslint-disable prettier/prettier */
// user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TranslationEntity } from '../../translation/entities/translation.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
  @Column({ nullable: true })
  profilePhotoUrl: string;

  @Column({ nullable: true })
  profilePhotoPublicId: string;
  
  @OneToMany(() => TranslationEntity, (translation) => translation.user)
  translations: TranslationEntity[];
  @Column({ nullable: true }) 
  resetToken: string;
}
