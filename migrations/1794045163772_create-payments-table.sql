-- Up Migration
CREATE TABLE payments(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount_kobo INT NOT NULL CHECK (amount_kobo > 0),
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
    customer_email TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Down Migration
DROP TABLE payments;