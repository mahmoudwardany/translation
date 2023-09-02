/* eslint-disable prettier/prettier */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcrypt';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from '../dto/signup.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { JwtPayload } from '../../util/jwt/jwt-payload';
import { v4 as uuidv4 } from 'uuid';
import { sendMail } from '../../util/nodeMailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  //Register
  async signup(body: SignupDto) {
    const user = await this.findUserByEmail(body.email);
    if (user) throw new ConflictException('Email Already exists');
    body.password = await this.hashPassword(body.password);
    const newUser = this.userRepository.create(body);
    const saveUser=await this.userRepository.save(newUser)
    delete saveUser.resetToken;
    return saveUser ;
  }

  //Login
  async signIn(body: LoginUserDto) {
    const { email, password } = body;
    const user = await this.findUserByEmail(email);
    if (!user) throw new ConflictException('Invalid email or password');
    const matchedPassword = await this.comparePassword(password, user.password);
    if (!matchedPassword)
      throw new ConflictException('Invalid email or password');
    delete user.password;
    delete user.resetToken;
    const payload: JwtPayload = {
      username: user.username,
      email: user.email,
      id: user.id,
    };
    const secret = this.configService.get<string>('JWT_SECRET');
    const accessToken = this.jwtService.sign(payload, { secret });
    return { accessToken, user };
  }

  //Request New password
  async requestResetPassword(email: string, link: string) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('Email not found');
    }
    const resetToken = uuidv4();
    user.resetToken = resetToken;
    await this.userRepository.save(user);
    const resetLink = `${link}/${resetToken}`;
    const emailBody = `Copy  link to and test it in Postman to reset your password: ${resetLink}`;
    await sendMail(email, 'Password Reset', emailBody);
  }
  //Update New Password
  async updatePassword(token: string, newPassword: string): Promise<void> {
    const user = await this.findByResetToken(token);
    if (!user) {
      throw new NotFoundException('Invalid Token');
    }
    user.password = await this.hashPassword(newPassword);
    user.resetToken = null;
    await this.userRepository.save(user);
  }
  //helpers
  async findUserByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }
  //find token
  async findByResetToken(resetToken: string): Promise<UserEntity> {
    return this.userRepository.findOneBy({ resetToken });
  }
  //hash Password
  async hashPassword(password: string) {
    return await hash(password, 10);
  }
  async comparePassword(password: string, userPassword: string) {
    return await compare(password, userPassword);
  }
  async findUserByResetToken(token: string) {
    return this.userRepository.findOneBy({ resetToken: token });
  }
}
