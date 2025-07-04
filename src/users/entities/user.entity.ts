/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { CURRENT_TIMESTAMP } from '../../../constants';
import { Order } from 'src/payments/entities/order.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: string;
  @Column({ unique: true, nullable: false })
  email: string;
  @Exclude()
  @Column({ nullable: false })
  password: string;
  @Column({ default: 'user' })
  role: string;
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
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
