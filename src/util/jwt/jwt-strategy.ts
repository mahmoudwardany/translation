/* eslint-disable prettier/prettier */
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserEntity } from '../../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from './jwt-payload';
import { UnauthorizedException } from '@nestjs/common';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:process.env.JWT_SECRET ,
    });
  }
  async validate(payload:JwtPayload){
    const {email} = payload
    const user = await this.userRepository.findOneBy({ email })
    if(!user) throw new UnauthorizedException('UnAuthorized')
    return user
  }
}
