import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { OrderStatus, RequestWithUser } from '../../types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    readonly jwtService: JwtService,
  ) {}

  async getProfile(req: RequestWithUser): Promise<User> {
    const { id } = req.user;
    const user: User | null = await this.userRepo.findOne({
      where: { id: String(id) },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getOrders(req: RequestWithUser): Promise<User> {
    const { id } = req.user;
    const user: User | null = await this.userRepo.findOne({
      where: { id: String(id) },
      relations: ['orders', 'orders.paymentId'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async deleteUser(req: RequestWithUser) {
    const { id } = req.user;
    const user: User | null = await this.userRepo.findOne({
      where: { id: String(id) },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepo.delete(id);
    return { message: 'User deleted successfully' };
  }

  async emptyOrdersHistory(req: RequestWithUser) {
    const { id } = req.user;
    const user: User | null = await this.userRepo.findOne({
      where: { id: String(id) },
      relations: ['orders'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only keep orders that are not DELIVERED or CANCELLED
    const ordersToRemove = user.orders.filter(
      (order) =>
        order.status === OrderStatus.DELIVERED ||
        order.status === OrderStatus.CANCELLED,
    );

    if (ordersToRemove.length === 0) {
      return { message: 'No delivered or cancelled orders to remove.' };
    }

    const orderRepo = this.userRepo.manager.getRepository('Order');
    await orderRepo.delete(ordersToRemove.map((order) => order.id));

    return { message: 'Order history emptied successfully.' };
  }
}
