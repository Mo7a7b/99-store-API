import {
  Body,
  Controller,
  Get,
  Post,
  Headers,
  Req,
  Res,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dtos/create-payment.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Response as ExpRes } from 'express';
import * as path from 'path';
import { RequestWithUser } from '../../types';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('createCheckout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Req() req: RequestWithUser,
    @Body() data: CreatePaymentDto,
  ) {
    return await this.paymentsService.createCheckoutSession(req, data);
  }
  @Post('webhook')
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.webhook(req, signature);
  }

  @Get('success')
  success(@Res() res: ExpRes) {
    const filePath = path.join(__dirname, '..', 'templates', 'success.html');
    return res.sendFile(filePath);
  }

  @Get('cancel')
  cancel(@Res() res: ExpRes) {
    const filePath = path.join(__dirname, '..', 'templates', 'cancel.html');
    return res.sendFile(filePath);
  }
}
