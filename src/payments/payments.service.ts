import { Injectable, Inject } from '@nestjs/common';
import { PG_POOL } from '../database/database.module.js';
import {Pool} from 'pg'
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { PaymentRow,toPayment,Payment } from './payment.types.js';

@Injectable()
export class PaymentsService {

    constructor(@Inject(PG_POOL) private readonly pool: Pool) { }
    
    async create(dto: CreatePaymentDto) : Promise<Payment> {
        const result = await this.pool.query<PaymentRow>(
        `INSERT INTO payments (amount_kobo, customer_email, description)
        VALUES ($1,$2,$3)
        RETURNING *`,
        [dto.amountKobo, dto.customerEmail, dto.description ?? null]
    );
    return toPayment(result.rows[0]);
    }
}

