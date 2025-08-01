import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
