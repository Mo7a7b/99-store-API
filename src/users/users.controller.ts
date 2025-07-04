import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpStatus,
  HttpCode,
  Res,
  Req,
  Get,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { AuthProvider } from './auth.provider';
import { Response, Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RequestWithUser } from '../../types';
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(
    private readonly authProvider: AuthProvider,
    private readonly usersService: UsersService,
  ) {}
  @Post('register')
  async register(@Body() credentials: RegisterUserDto) {
    return await this.authProvider.register(credentials);
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() credentials: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authProvider.login(credentials, res);
  }
  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookies = req.cookies as { [key: string]: any } | undefined;
    const refreshToken =
      typeof cookies?.refreshToken === 'string'
        ? cookies.refreshToken
        : undefined;
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }
    return await this.authProvider.refreshToken(refreshToken, res);
  }
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authProvider.logout(res);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: RequestWithUser) {
    return await this.usersService.getProfile(req);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async getOrders(@Req() req: RequestWithUser) {
    return await this.usersService.getOrders(req);
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req: RequestWithUser) {
    return await this.usersService.deleteUser(req);
  }

  @Post('empty/orders/history')
  @UseGuards(JwtAuthGuard)
  async emptyOrdersHistory(@Req() req: RequestWithUser) {
    return await this.usersService.emptyOrdersHistory(req);
  }
}
