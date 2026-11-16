import { Body, Controller, Post, Get, Param, ParseUUIDPipe, NotFoundException } from '@nestjs/common';
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
    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Payment> {
        const payment = await this.paymentService.findOne(id);
        if (!payment){
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }
}
