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
