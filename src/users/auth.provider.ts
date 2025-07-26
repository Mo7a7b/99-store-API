/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class AuthProvider {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    readonly jwtService: JwtService,
  ) {}

  async register(credentials: RegisterUserDto) {
    const existingUser = await this.userRepo.findOne({
      where: { email: credentials.email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(credentials.password, 10);
    const user = this.userRepo.create({
      ...credentials,
      password: hashedPassword,
    });
    return await this.userRepo.save(user);
  }

  async login(credentials: LoginUserDto, res: any) {
    const user = await this.userRepo.findOne({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Compare hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload = { id: user.id, role: user.role };
    const { accessToken, refreshToken } = await this.generateToken(payload);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.cookie('isAuthenticated', 'true', {
      secure: false,
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    return { user };
  }
  private async generateToken(payload: {
    [key: string]: any;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }
  async refreshToken(token: string, res: Response) {
    const publicKey = fs.readFileSync(
      join(__dirname, '../../keys/public-key.pem'),
    );
    try {
      const payload: { id: number } = await this.jwtService.verifyAsync(token, {
        secret: publicKey,
        algorithms: ['RS256'],
        issuer: 'ecommerce-store',
      });
      const user = await this.userRepo.findOne({
        where: { id: String(payload.id) },
      });
      if (!user) {
        throw new BadRequestException('Invalid refresh token');
      }
      const newPayload = { id: user.id, role: user.role };
      const { accessToken, refreshToken } =
        await this.generateToken(newPayload);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.cookie('isAuthenticated', 'true', {
        secure: false,
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      return { user };
    } catch {
      throw new BadRequestException('Invalid or expired refresh token');
    }
  }
  logout(res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    });
    res.clearCookie('isAuthenticated', {
      secure: false,
      httpOnly: false,
      sameSite: 'lax',
    });
    return { message: 'Logged out successfully' };
  }
}
