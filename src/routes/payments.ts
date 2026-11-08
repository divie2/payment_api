import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../db.ts";
import { CreatePaymentSchema, toPayment } from "../schemas/payment.ts";
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

//   const insert = await pool.query(
//     `INSERT INTO payments (amount_kobo, customer_email, description)
//      VALUES ($1,$2,$3)
//      RETURNING *`,
//     [amountKobo, customerEmail, description ?? null]
//   );

//   // 3. Respond
//   res.status(201).json(insert.rows[0]);
});
