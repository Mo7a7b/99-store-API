import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    JwtModule.registerAsync({
      useFactory: () => {
        const privateKey = fs.readFileSync('../../keys/private-key.pem');
        return {
          global: true,
          secret: privateKey,
          signOptions: {
            algorithm: 'RS256',
            issuer: 'ecommerce-store',
            expiresIn: '15m',
          },
        };
      },
    }),
    CloudinaryModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
