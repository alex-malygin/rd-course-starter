CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key UUID UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    total_amount DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL
);


INSERT INTO users (id, email, password, first_name, last_name)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'test@example.com', 'password', 'Ivan', 'Ivanov')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (id, name, description, price, stock)
VALUES 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Laptop', 'Powerful laptop', 1500.00, 10),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Smartphone', 'Latest model', 800.00, 20),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Headphones', 'Noise cancelling', 200.00, 50)
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (idempotency_key, user_id, total_amount, status, created_at)
SELECT 
    gen_random_uuid(), 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
    random() * 1000, 
    'COMPLETED',
    now() - (random() * interval '30 days')
FROM generate_series(1, 1000);
