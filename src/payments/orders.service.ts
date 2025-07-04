import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Order } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OrderStatus, RequestWithUser } from 'types';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  getOrders(req: RequestWithUser) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.orderRepo.find({
      relations: ['paymentId'],
      where: {
        status: In([
          OrderStatus.PENDING,
          OrderStatus.ACCEPTED,
          OrderStatus.SHIPPED,
        ]),
      },
    });
  }

  getPendingOrders(req: RequestWithUser) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.orderRepo.find({
      relations: ['paymentId'],
      where: {
        status: OrderStatus.PENDING,
      },
    });
  }

  async acceptOrder(id: string, estimatedDeliveryDate: Date) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new UnauthorizedException('Order not found');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Order can only be accepted if it is pending',
      );
    }
    return this.orderRepo.update(id, {
      status: OrderStatus.ACCEPTED,
      estimatedDelivery: estimatedDeliveryDate,
    });
  }

  async cancelOrder(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new UnauthorizedException('Order not found');
    }
    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Cannot cancel an order that is shipped or delivered',
      );
    }
    return this.orderRepo.update(id, {
      status: OrderStatus.CANCELLED,
      estimatedDelivery: null,
    });
  }

  async shipOrder(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new UnauthorizedException('Order not found');
    }
    if (order.status !== OrderStatus.ACCEPTED) {
      throw new BadRequestException(
        'Order can only be shipped if it is accepted',
      );
    }
    return this.orderRepo.update(id, {
      status: OrderStatus.SHIPPED,
    });
  }

  async deliverOrder(id: string) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new UnauthorizedException('Order not found');
    }
    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException(
        'Order can only be delivered if it is shipped',
      );
    }
    return this.orderRepo.update(id, {
      status: OrderStatus.DELIVERED,
      estimatedDelivery: null,
    });
  }
}
