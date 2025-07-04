import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import {
  IsString,
  IsNumber,
  IsArray,
  IsIn,
  ArrayUnique,
  IsEnum,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Brands, Categories, SubCategories } from '../../../types';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty()
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number' })
  @Min(1)
  price: number;

  @IsString({ message: 'Category must be a string' })
  @IsEnum(Categories)
  @IsNotEmpty()
  category: string;

  @IsString({ message: 'Subcategory must be a string' })
  @IsEnum(SubCategories)
  @IsNotEmpty()
  subCategory: string;

  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(1)
  @Max(1000)
  stock: number;

  @IsString({ message: 'Brand must be a string' })
  @IsEnum(Brands)
  brand: string;

  @IsArray({ message: 'Sizes must be an array' })
  @IsString({ each: true, message: 'Each size must be a string' })
  @IsIn(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'], {
    each: true,
    message: 'Each size must be one of XS, S, M, L, XL, 2XL, 3XL, 4XL, 5XL',
  })
  @ArrayUnique({ message: 'Sizes must not contain duplicates' })
  sizes?: string[];
}
