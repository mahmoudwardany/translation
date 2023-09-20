/* eslint-disable prettier/prettier */
import { Controller, Post, Body, HttpCode, Req, Param, Patch, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { GetUser } from '@app/util/get-user.decorator';
import { UserEntity } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import {multerConfig} from '../../config/multer.config';



@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly configService: ConfigService,  ) {}

  // Load Cloudinary API credentials from environment variables
  private configureCloudinary(): void {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    cloudinary.config({ 
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }
  // Register a new user
  @Post('register')
  async register(@Body() body: SignupDto) {
    return await this.userService.signup(body);
  }

  // User login
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginUserDto) {
    return await this.userService.signIn(body);
  }

  // Send reset password email
  @Post('reset-password')
  async sendResetPasswordEmail(@Body('email') email: string, @Req() req: Request) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    const link = `${protocol}://${host}/api/v1/user/reset-password`;
    await this.userService.requestResetPassword(email, link);
    return { message: "Check your email to reset password" };
  }

  // Update user password
  @Patch('reset-password/:token')
  async updatePassword(
    @Param('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.userService.updatePassword(token, newPassword);
    return { message: 'Password updated successfully' };
  }

  // Upload user profile photo
  @Post('profile-photo')
  @UseGuards(AuthGuard())
  @UseInterceptors(FileInterceptor('profilePicture', multerConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: UserEntity,
  ) {
    if (!file) {
      return { message: 'No file uploaded' };
    }
    
    const currentPublicId = user.profilePhotoPublicId;
    this.configureCloudinary(); 

    const uploadResult = await cloudinary.uploader.upload(file.path);
    const newCloudinaryUrl = uploadResult.secure_url;
    const newPublicId = uploadResult.public_id;

    await this.userService.updateProfilePhoto(user.id, newCloudinaryUrl, newPublicId);

    if (currentPublicId) {
      await cloudinary.uploader.destroy(currentPublicId);
    }
    return { message: "Profile Picture Updated", PictureUrl: newCloudinaryUrl };
  }
}
