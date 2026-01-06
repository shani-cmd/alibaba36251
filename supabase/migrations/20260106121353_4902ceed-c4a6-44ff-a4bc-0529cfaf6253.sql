-- Add server-side validation constraints for orders table
ALTER TABLE public.orders 
  ALTER COLUMN customer_name TYPE VARCHAR(100),
  ALTER COLUMN customer_email TYPE VARCHAR(255),
  ALTER COLUMN customer_phone TYPE VARCHAR(30),
  ALTER COLUMN delivery_address TYPE VARCHAR(500),
  ALTER COLUMN delivery_city TYPE VARCHAR(100),
  ALTER COLUMN delivery_postal_code TYPE VARCHAR(20),
  ALTER COLUMN notes TYPE VARCHAR(1000);

-- Add check constraints for email format
ALTER TABLE public.orders
  ADD CONSTRAINT orders_email_format 
  CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- Add check constraint for positive values
ALTER TABLE public.orders
  ADD CONSTRAINT orders_positive_total CHECK (total >= 0),
  ADD CONSTRAINT orders_positive_subtotal CHECK (subtotal >= 0);

-- Add length constraints for order_items
ALTER TABLE public.order_items
  ALTER COLUMN product_name TYPE VARCHAR(200),
  ALTER COLUMN notes TYPE VARCHAR(500);

-- Add check constraints for order_items
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_positive_quantity CHECK (quantity > 0),
  ADD CONSTRAINT order_items_positive_prices CHECK (unit_price >= 0 AND total_price >= 0);