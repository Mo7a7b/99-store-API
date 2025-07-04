import { IsEnum, IsNumber, IsObject, IsString } from 'class-validator';
import { Cart } from 'types';

enum Currency {
  USD = 'usd',
  EUR = 'eur',
  GBP = 'gbp',
}

export class CreatePaymentDto {
  @IsObject()
  cart: Cart;
  @IsNumber()
  amount: number;
  @IsEnum(Currency)
  currency: string;
  @IsString()
  address: string;
}
