// src/stripe/stripe.service.ts
import {
  BadRequestException,
  Injectable,
  RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payments.entity';
import { DeepPartial, Repository } from 'typeorm';
import { RequestWithUser } from '../../types';
import { Order } from './entities/order.entity';
import { Product } from '../../src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not defined in environment variables',
      );
    }
    this.stripe = new Stripe(stripeSecretKey);
  }

  async createCheckoutSession(req: RequestWithUser, data: CreatePaymentDto) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: data.cart.products.map((product) => ({
        price_data: {
          currency: data.currency,
          product_data: {
            name: product.name,
            images: product.images,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: product.quantity,
      })),
      metadata: {
        userId: req.user?.id ?? '', // Ensure string, not undefined
        cart: JSON.stringify(data.cart),
        address: data.address,
      },
      mode: 'payment',
      success_url: 'https://99-store-api.vercel.app/payments/success',
      cancel_url: 'https://99-store-api.vercel.app/payments/cancel',
    });
    return { id: session.id, url: session.url };
  }

  async webhook(req: RawBodyRequest<Request>, sig: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    let event: Stripe.Event;

    try {
      if (!webhookSecret) {
        throw new Error(
          'STRIPE_WEBHOOK_SECRET is not defined in environment variables',
        );
      }
      if (!req.rawBody) {
        throw new BadRequestException(
          'No raw body found on request for Stripe webhook',
        );
      }
      const body = Buffer.isBuffer(req.rawBody)
        ? req.rawBody
        : Buffer.from(req.rawBody as string, 'utf8');
      event = this.stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${(err as Error).message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session: Stripe.Checkout.Session = event.data.object;
        try {
          const payment: Payment = this.paymentRepo.create({
            sessionId: session.id,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency ?? 'usd',
            status: this.mapStripeStatusToDb(session.payment_status),
            paymentMethod: session.payment_method_types
              ? session.payment_method_types.join(',')
              : null,
            deliveryPrice: 20,
          } as DeepPartial<Payment>);
          await this.paymentRepo.save(payment);
          // Reduce Stock Number of the ordered products
          const cart = JSON.parse(session.metadata?.cart ?? '{}') as {
            products: { id: string; stock: number; quantity: number }[];
          };
          for (const product of cart.products) {
            await this.productRepo.update(product.id, {
              stock: product.stock - product.quantity,
            });
          }
          const user: User | null = await this.userRepo.findOne({
            where: { id: session.metadata?.userId },
          });
          const order = this.orderRepo.create({
            payment: payment,
            user: user,
            cart: session.metadata?.cart
              ? (JSON.parse(session.metadata.cart) as {
                  [key: string]: unknown;
                })
              : null,
            totalAmount: payment.amount + payment.deliveryPrice,
            deliveryPrice: payment.deliveryPrice,
            shippingAddress: session.metadata?.address ?? null,
          } as DeepPartial<Order>);
          await this.orderRepo.save(order);
        } catch (err) {
          console.error('Error saving payment:', err, 'Session:', session);
          throw new BadRequestException(err);
        }
        break;
      }
      default:
        console.log(event.type);
        break;
    }

    return { received: true };
  }

  private mapStripeStatusToDb(status: string): string {
    switch (status) {
      case 'paid':
        return 'completed';
      case 'unpaid':
        return 'pending';
      case 'no_payment_required':
        return 'pending';
      default:
        return 'pending'; // or throw an error if you want to be strict
    }
  }
}
