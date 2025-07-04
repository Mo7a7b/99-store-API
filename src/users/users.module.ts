import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthProvider } from './auth.provider';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { UsersService } from './users.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: () => {
        const privateKey = fs.readFileSync('../../.keys/private-key.pem');
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
  ],
  controllers: [UsersController],
  providers: [AuthProvider, UsersService],
})
export class UsersModule {}
