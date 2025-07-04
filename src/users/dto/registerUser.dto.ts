/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'email field must be a valid Email' })
  email: string;
  @IsString({ message: 'password must be a string' })
  @IsStrongPassword({
    minLength: 8,
    minSymbols: 1,
    minNumbers: 1,
    minUppercase: 1,
  })
  password: string;
}
