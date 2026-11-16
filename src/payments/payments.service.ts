import { Injectable, Inject } from '@nestjs/common';
import { PG_POOL } from '../database/database.module.js';
import { Pool } from 'pg'
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { PaymentRow, toPayment, Payment, PaymentList } from './payment.types.js';
import { ListPaymentsQueryDto } from './dto/list-payments-query.dto.js';

@Injectable()
export class PaymentsService {

    constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

    async create(dto: CreatePaymentDto): Promise<Payment> {
        const result = await this.pool.query<PaymentRow>(
            `INSERT INTO payments (amount_kobo, customer_email, description)
        VALUES ($1,$2,$3)
        RETURNING *`,
            [dto.amountKobo, dto.customerEmail, dto.description ?? null]
        );
        return toPayment(result.rows[0]);
    }

    async findOne(id: string): Promise<Payment | undefined> {
        const result = await this.pool.query<PaymentRow>(
            'SELECT * FROM payments WHERE id = $1', [id]
        );

        const row = result.rows[0]
        if (!row) {
            return undefined
        }
        return toPayment(row);
    }

    async findAll(query: ListPaymentsQueryDto): Promise<PaymentList> {

        const { status, page, limit } = query;

        const offset = (page - 1) * limit

        const [listResult, countResult] = await Promise.all([
            this.pool.query<PaymentRow>(
                ` SELECT * FROM payments 
                WHERE ($1::text IS NULL OR status = $1) 
                ORDER BY created_at DESC, id DESC 
                LIMIT $2 OFFSET $3`, [status ?? null, limit, offset]

            ),
            this.pool.query<{ total: string }>(
                `SELECT COUNT(*) as total FROM payments WHERE ($1::text IS NULL OR status = $1)`, [status ?? null]
            ),
        ]);

        const total = Number(countResult.rows[0].total)

        const totalPages = Math.ceil(total / limit)

        return {
            data: listResult.rows.map(toPayment),   
            pagination: { page, limit, total, totalPages }
        }

    }
}

