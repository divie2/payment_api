import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../db.ts";
import { CreatePaymentSchema, ListPaymentsQuerySchema, toPayment } from "../schemas/payment.ts";
import type {PaymentRow} from "../schemas/payment.ts"


export const paymentsRouter = Router();


paymentsRouter.post("/", async (req: Request, res: Response) => {
  // 1. Validate
  const result = CreatePaymentSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: "Invalid request",
      details: z.flattenError(result.error).fieldErrors,
    });
    return;
  }
  const { amountKobo, customerEmail, description } = result.data;

  // 2. Save
    const insert = await pool.query<PaymentRow>(
    `INSERT INTO payments (amount_kobo, customer_email, description)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [amountKobo, customerEmail, description ?? null]
    );
    res.status(201).json(toPayment(insert.rows[0]));

});

paymentsRouter.get("/summary", async (req: Request, res: Response) => {

 
  const result = await pool.query<{ totalCount: number, byStatus: {pending: number,success: number, failed: number }, successAmountKobo: string, averageAmountKobo: number }>(
       `
    SELECT 
      COUNT(*)::INT AS "totalCount",
      JSON_BUILD_OBJECT(
        'pending', COUNT(*) FILTER (WHERE status = 'pending') ::INT,
        'success', COUNT(*) FILTER (WHERE status = 'success') ::INT,
        'failed',  COUNT(*) FILTER (WHERE status = 'failed') ::INT
      ) AS "byStatus",
      COALESCE(SUM(amount_kobo) FILTER (WHERE status = 'success') , 0) AS "successAmountKobo",
      COALESCE(ROUND(AVG(amount_kobo) FILTER (WHERE status = 'success')::INT ),0) AS "averageAmountKobo"
    FROM payments;
  `);

  const summary = result.rows[0]
  
  res.json({
    totalCount: summary.totalCount, byStatus: summary.byStatus, successAmountKobo: Number(summary.successAmountKobo), averageAmountKobo: summary.averageAmountKobo
  });

});

paymentsRouter.get("/:id", async (req: Request, res: Response) => {
  // 1. Validate
  const idCheck = z.uuid().safeParse(req.params.id);
  if (!idCheck.success) {
    res.status(400).json({
      error: "id must be a valid UUID"
    });
    return;
  }
 
    const result = await pool.query<PaymentRow>(
        'SELECT * FROM payments WHERE id = $1', [idCheck.data]
    );

    const payment = result.rows[0]
    if (!payment){
        res.status(404).json({ error: "Payment not found" });             // fix: an object, like other errors
    return;
    }

    res.json(toPayment(payment));                                        // fix: 200 (default), not 201

});


paymentsRouter.get("/", async (req: Request, res: Response) => {

  const queryCheck = ListPaymentsQuerySchema.safeParse(req.query);

  if (!queryCheck.success) {
    res.status(400).json({
      details: z.flattenError(queryCheck.error).fieldErrors,
      error: 'Invalid query parameter'
    });
    return; 
  }

  const { status, page, limit } = queryCheck.data;

  const offset = (page - 1) * limit


  const [listResult, countResult] = await Promise.all([
    pool.query<PaymentRow>(
      ' SELECT * FROM payments WHERE ($1::text IS NULL OR status = $1) ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3', [status ?? null,limit, offset]

    ),
    pool.query<{ total: string }>(
      'SELECT Count(*) as total FROM payments WHERE ($1::text IS NULL OR status = $1)', [status ?? null]
    ),
    ]);

  const total = Number(countResult.rows[0].total)

  const totalPages = Math.ceil(total / limit)



  res.json({
      
      data: listResult.rows.map(toPayment),   // ✅ each row → an API payment,
      pagination: {"page": page, "limit": limit, "total": total, "totalPages": totalPages}

    });


});
