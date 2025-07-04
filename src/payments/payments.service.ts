// src/stripe/stripe.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payments.entity';
import { Repository } from 'typeorm';
import { RequestWithUser } from '../../types';
import { Order } from './entities/order.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
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
            description: product.description,
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
      success_url: 'http://localhost:3000/payments/success',
      cancel_url: 'http://localhost:3000/payments/cancel',
    });
    return { id: session.id, url: session.url };
  }

  async webhook(req: Request) {
    const sig = req.headers['stripe-signature'] as string | undefined;
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
      const typedReq = req as Request & { rawBody?: Buffer; body?: Buffer };
      const buf: Buffer | undefined = typedReq.rawBody ?? typedReq.body;
      if (!buf) {
        throw new BadRequestException(
          'No raw body found on request for Stripe webhook',
        );
      }
      event = this.stripe.webhooks.constructEvent(
        buf,
        sig as string,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${(err as Error).message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session: Stripe.Checkout.Session = event.data.object;
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const payment: Payment = await this.paymentRepo.save({
            sessionId: session.id,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency,
            status: this.mapStripeStatusToDb(session.payment_status),
            paymentMethod: session.payment_method_types
              ? session.payment_method_types.join(',')
              : null,
            userId: session.metadata?.userId ?? null,
          } as any);

          await this.orderRepo.save({
            paymentId: payment.id,
            user: session.metadata?.userId ?? null,
            cart: session.metadata?.cart
              ? (JSON.parse(session.metadata.cart) as {
                  [key: string]: unknown;
                })
              : null,
            totalAmount: payment.amount,
            shippingAddress: session.metadata?.address ?? null,
          } as any);
        } catch (err) {
          console.error('Error saving payment:', err, 'Session:', session);
          throw new BadRequestException('Failed to save payment');
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
