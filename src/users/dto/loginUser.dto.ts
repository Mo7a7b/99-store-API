/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'email field must be a valid Email' })
  email: string;
  @IsString({ message: 'password must be a string' })
  password: string;
}
