import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { Payment } from './payment.types.js';

@Controller('payments')
export class PaymentsController {

    constructor(private readonly paymentService: PaymentsService) { }
    
    @Post()
    async create(@Body() dto: CreatePaymentDto) : Promise<Payment>{
        return await this.paymentService.create(dto)

    }
}
