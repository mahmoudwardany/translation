/* eslint-disable prettier/prettier */
import { MulterModuleOptions } from '@nestjs/platform-express';
import { Request } from 'express';


export const multerConfig: MulterModuleOptions = {
  dest: './images', 
  storage: undefined, 
  fileFilter: (req: Request, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    // Define a file filter to accept or reject files based on your criteria
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
      callback(null, true); 
    } else {
      callback(new Error('Invalid file type'), false); 
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, 
  },
};
