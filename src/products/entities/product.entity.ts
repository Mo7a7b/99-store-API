import {
  Entity,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from '../../../constants';
import { Brands, Categories, SubCategories } from 'types';
@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  price: number;

  @Column({ nullable: false })
  stock: number;

  @Column('text', { array: true })
  images: string[];

  @Column({ nullable: false, enum: Categories })
  category: string;

  @Column({ nullable: false, enum: SubCategories })
  subCategory: string;

  @Column({ nullable: true, enum: Brands, default: Brands.OTHER })
  brand: string;

  @Column('text', {
    array: true,
    default: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
  })
  sizes?: string[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => CURRENT_TIMESTAMP,
    onUpdate: CURRENT_TIMESTAMP,
  })
  updatedAt: Date;
}
