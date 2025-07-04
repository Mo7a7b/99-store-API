import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roleGuard.guard';
import { RequestWithUser } from 'types';

@Controller('orders')
export class OrderController {
  constructor(private readonly ordersService: OrdersService) {}
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  getOrders(@Req() req: RequestWithUser) {
    return this.ordersService.getOrders(req);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getPendingOrders(@Req() req: RequestWithUser) {
    return this.ordersService.getPendingOrders(req);
  }

  @Post('accept/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  acceptOrder(@Param('id') id: string, @Body() estimatedDeliveryDate: Date) {
    return this.ordersService.acceptOrder(id, estimatedDeliveryDate);
  }

  @Post('ship/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  shipOrder(@Param('id') id: string) {
    return this.ordersService.shipOrder(id);
  }

  @Post('deliver/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  deliverOrder(@Param('id') id: string) {
    return this.ordersService.deliverOrder(id);
  }

  @Post('cancel/:id')
  @UseGuards(JwtAuthGuard)
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }
}
