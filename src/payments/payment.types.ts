
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

export interface PaymentList {

    data: Payment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };

}

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
