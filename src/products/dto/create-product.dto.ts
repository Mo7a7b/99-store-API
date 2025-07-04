import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsNotEmpty,
  IsArray,
  IsIn,
  ArrayUnique,
} from 'class-validator';
import { Brands, Categories, SubCategories } from 'types';

export class CreateProductDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty()
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number' })
  @Min(1)
  @Transform(({ value }) => parseFloat(value))
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
  @Transform(({ value }) => parseInt(value))
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
  @Transform(({ value }): string[] => (Array.isArray(value) ? value : [value])) // []
  @IsOptional()
  sizes?: string[];
}
