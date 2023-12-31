/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './controller/user.controller';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm'; 
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt'; 
import { ConfigService } from '@nestjs/config';
import { UserService } from './service/user.service';
import { SignupDto } from './dto/signup.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserEntity } from './entities/user.entity';
import { Request } from 'express';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity), 
          useClass: Repository,
        },
        {
          provide: JwtService, 
          useValue: {
            requestResetPassword: jest.fn(),
          updatePassword: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {}, 
        },
      ],
    }).compile();
    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });
  describe('register', () => {
    it('should call userService.signup and return the result', async () => {
      const signupDto: SignupDto = {
        username: 'test',
        email: 'test@example.com',
        password: 'password123',
      };//نعرف المدخلات
        const mockUser: UserEntity = {
        id: 1,
        username: 'test',
        email: 'test@example.com',
        password: 'hashedPassword', 
        translations: [], 
        resetToken: null, 
      };
   const signUpSpy=   jest.spyOn(userService, 'signup').mockResolvedValue(mockUser);
      const result = await userController.register(signupDto);
      console.log(result)
      expect(signUpSpy).toHaveBeenCalledWith(signupDto)
      expect(result).toEqual(mockUser);
    });
    it('should throw ConflictException if signUp throws ConflictException', async () => {
      const signupDto: SignupDto = {
        username:"test",
        email: 'test@example.com',
        password: 'incorrectPassword',
      };
      const conflictException = new ConflictException('Email Already exists');
      jest.spyOn(userService, 'signup').mockRejectedValue(conflictException);
      await expect(userController.register(signupDto)).rejects.toThrow(conflictException);
    });
  });
  describe('login', () => {
    it('should call userService.signIn and return the result', async () => {
const loginDto:LoginUserDto={
  email:'test@exmaple.com',
  password:"comapred password"
}
const expectedAccessToken = 'mockedToken'
const expectedUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testUsername',
  password: 'mockedPassword',
  translations: [], 
  resetToken: null, 
};
const mockSignInResult = {
  accessToken: expectedAccessToken,
  user: expectedUser,
};
const signInSpy = jest
.spyOn(userService, 'signIn')
.mockResolvedValue(mockSignInResult);
const result = await userController.login(loginDto)
expect(result).toEqual(mockSignInResult)
expect(signInSpy).toHaveBeenCalledWith(loginDto)
    });

    it('should throw ConflictException if signIn throws ConflictException', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'incorrectPassword',
      };
      const conflictException = new ConflictException('Invalid email or password');
      jest.spyOn(userService, 'signIn').mockRejectedValue(conflictException);
      await expect(userController.login(loginUserDto)).rejects.toThrow(conflictException);
    });
  });
  describe('sendResetPasswordEmail', () => {
    it('should call userService.requestResetPassword and return the result', async () => {
      const email = 'test@example.com';
      const link = 'http://localhost/api/v1/user/reset-password';
      const expectedResult = { message: 'check your email to reset password' };
      const mockRequest = {
        headers: {
          'x-forwarded-proto': 'http',
          'host': 'localhost',
        },
      } as unknown as Request;
    const requestMock =   jest.spyOn(userService, 'requestResetPassword').mockResolvedValue();
      const result = await userController.sendResetPasswordEmail(email, mockRequest as any);
      expect(requestMock).toHaveBeenCalledWith(email, link);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if userService.requestResetPassword throws NotFoundException', async () => {
      const email = 'test@example.com';
      const notFoundException = new NotFoundException('email not found');

      const mockRequest = {
        headers: {
          'x-forwarded-proto': 'http',
          'host': 'localhost',
        },
      } as unknown as Request;

      jest.spyOn(userService, 'requestResetPassword').mockRejectedValue(notFoundException);
      await expect(userController.sendResetPasswordEmail(email, mockRequest as any)).rejects.toThrow(
        notFoundException,
      );
    });
  });
  describe('updatePassword', () => {
    it('should call userService.updatePassword and return the result', async () => {
      const token = 'mockedToken';
      const newPassword = 'newPassword123';
      const expectedResult = { message: 'Password Update Successfully' };
     const mockUpadate = jest.spyOn(userService, 'updatePassword').mockResolvedValue();
      const result = await userController.updatePassword(token, newPassword);
      expect(mockUpadate).toHaveBeenCalledWith(token, newPassword);
      expect(result).toEqual(expectedResult);
    });
    it('should throw NotFoundException if userService.updatePassword throws NotFoundException', async () => {
      const token = 'mockedToken';
      const newPassword = 'newPassword123';
      const notFoundException = new NotFoundException('Invalid Token');
      jest.spyOn(userService, 'updatePassword').mockRejectedValue(notFoundException);
      await expect(userController.updatePassword(token, newPassword)).rejects.toThrow(notFoundException);
    });
  });
  });
