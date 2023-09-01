/* eslint-disable prettier/prettier */
import { Controller, Post, Body, HttpCode, Req, Param, Patch } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginUserDto } from '../dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('register')
  async register(@Body() body: SignupDto) {
    return await this.userService.signup(body);
  }
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginUserDto) {
    return await this.userService.signIn(body);
  }


  @Post('reset-password')
  async sendResetPasswordEmail(@Body('email') email: string,@Req() req: Request,
  ) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    const link=`${protocol}://${host}/api/v1/user/reset-password`
    await this.userService.requestResetPassword(email,link);
    return {message:"check your email to reset password"}
  }
  @Patch('reset-password/:token')
  async updatePassword(
    @Param('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.userService.updatePassword(token, newPassword);
    return {message:'Password Update Successfully'}
  }
}
