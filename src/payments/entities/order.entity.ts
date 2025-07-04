import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CURRENT_TIMESTAMP } from '../../../constants';
import { Cart, OrderStatus } from '../../../types';
import { Payment } from './payments.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => User, (user) => user.orders, { nullable: false })
  user: string;

  @Column('jsonb')
  cart: Cart;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @OneToOne(() => Payment, { onDelete: 'CASCADE' })
  @JoinColumn()
  paymentId: string;

  @Column({ nullable: true })
  shippingAddress: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  estimatedDelivery: Date | null;

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
