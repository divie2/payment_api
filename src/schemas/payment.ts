import { z } from "zod";

// What the DATABASE gives us (snake_case)
export interface PaymentRow {
  id: string;
  amount_kobo: number;
  currency: string;
  status: "pending" | "success" | "failed";
  customer_email: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

// What the API sends back (camelCase)
export interface Payment {
  id: string;
  amountKobo: number;
  currency: string;
  status: "pending" | "success" | "failed";
  customerEmail: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}


export const CreatePaymentSchema = z.object({
  amountKobo: z.number().int().positive().max(100_000_000),
  customerEmail: z.email(),
  description: z.string().max(200).optional()
});

export function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    amountKobo: row.amount_kobo,
    currency: row.currency,
    status: row.status,
    customerEmail: row.customer_email,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    
  };
}
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;

