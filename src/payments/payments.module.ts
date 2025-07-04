import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payments.entity';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { Order } from './entities/order.entity';
import { OrderController } from './order.controller';
import { OrdersService } from './orders.service';
import { join } from 'path';
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
    JwtModule.registerAsync({
      useFactory: () => {
        const privateKey = fs.readFileSync(
          join(__dirname, '../../keys/private-key.pem'),
        );
        return {
          global: true,
          secret: privateKey,
          signOptions: {
            algorithm: 'RS256',
            issuer: 'ecommerce-store',
            expiresIn: '15m',
          },
        };
      },
    }),
  ],
  controllers: [PaymentsController, OrderController],
  providers: [PaymentsService, OrdersService],
})
export class PaymentsModule {}
