
-- Enum Types for Order Statuses
CREATE TYPE order_status AS ENUM ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded');
CREATE TYPE payment_status AS ENUM ('Pending', 'Paid', 'Blocked', 'Expired');
CREATE TYPE logistic_status AS ENUM ('Awaiting Shipment', 'In Transit', 'Out for Delivery', 'Delivered');
CREATE TYPE business_type AS ENUM ('B2B', 'B2C', 'C2C');


-- Orders Table: Main table to store order information
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id),
    buyer_id UUID NOT NULL REFERENCES marketplace_users(id),
    total_amount NUMERIC(10, 2) NOT NULL,
    commission_amount NUMERIC(10, 2) NOT NULL,
    marketplace_profit NUMERIC(10, 2) NOT NULL,
    shipping_cost NUMERIC(10, 2) DEFAULT 0.00,
    status order_status NOT NULL DEFAULT 'Pending',
    payment_status payment_status NOT NULL DEFAULT 'Pending',
    logistic_status logistic_status NOT NULL DEFAULT 'Awaiting Shipment',
    payment_method VARCHAR(50),
    business_type business_type NOT NULL,

    -- Shipping Information
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_country VARCHAR(100),
    shipping_company VARCHAR(100),
    tracking_code VARCHAR(100),
    
    -- Timestamps
    estimated_delivery_at TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items Table: Connects orders with products
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price_at_purchase NUMERIC(10, 2) NOT NULL,
    product_name VARCHAR(255) NOT NULL, -- Denormalized for easier access
    sku VARCHAR(100),
    weight NUMERIC(8, 2),
    dimensions VARCHAR(100)
);

-- Order Events Table: Stores the timeline of an order
CREATE TABLE order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- Can reference order_status enum or custom events like 'Payment Confirmed'
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_events_order_id ON order_events(order_id);
