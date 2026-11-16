import { Body, Controller, Post, Get, Param, ParseUUIDPipe, NotFoundException, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import type { Payment, PaymentList } from './payment.types.js';
import { ListPaymentsQueryDto } from './dto/list-payments-query.dto.js';

@Controller('payments')
export class PaymentsController {

    constructor(private readonly paymentService: PaymentsService) { }
    
    @Post()
    async create(@Body() dto: CreatePaymentDto) : Promise<Payment>{
        return await this.paymentService.create(dto)
    }

    @Get()
    async listPayments(@Query() query: ListPaymentsQueryDto): Promise<PaymentList> {
        return await this.paymentService.findAll(query)
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Payment> {
        const payment = await this.paymentService.findOne(id);
        if (!payment){
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }
}
