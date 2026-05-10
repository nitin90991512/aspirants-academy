-- =============================================
-- 006: FEES TABLES
-- Aspirants Academy ERP
-- =============================================

-- =============================================
-- FEE STRUCTURES
-- =============================================
create table fee_structures (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  class_id uuid references classes(id),
  academic_year_id uuid references academic_years,
  amount numeric(10,2) not null,
  frequency text default 'monthly',
  due_day integer default 10,
  late_fee_amount numeric(8,2) default 0,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- =============================================
-- FEE INVOICES
-- =============================================
create table fee_invoices (
  id uuid primary key default uuid_generate_v4(),
  invoice_number text unique,
  student_id uuid references students(id),
  fee_structure_id uuid references fee_structures(id),
  academic_year_id uuid references academic_years,
  amount numeric(10,2) not null,
  late_fee numeric(8,2) default 0,
  discount numeric(8,2) default 0,
  discount_reason text,
  total_amount numeric(10,2) not null,
  status fee_status default 'pending',
  due_date date not null,
  month integer,
  year integer,
  created_at timestamptz default now()
);

-- Auto-generate invoice number
create sequence invoice_seq start 1;
create or replace function generate_invoice_number()
returns trigger as $$
begin
  if new.invoice_number is null then
    new.invoice_number := 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_seq')::text, 4, '0');
  end if;
  new.total_amount := new.amount + coalesce(new.late_fee, 0) - coalesce(new.discount, 0);
  return new;
end;
$$ language plpgsql;

create trigger auto_invoice_number
  before insert on fee_invoices
  for each row execute function generate_invoice_number();

-- =============================================
-- PAYMENTS
-- =============================================
create table fee_payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references fee_invoices(id),
  student_id uuid references students(id),
  amount_paid numeric(10,2) not null,
  payment_method payment_method not null,
  transaction_id text,
  razorpay_payment_id text,
  receipt_number text unique,
  paid_at timestamptz default now(),
  collected_by uuid references profiles(id),
  notes text,
  created_at timestamptz default now()
);

-- Auto-generate receipt number
create sequence receipt_seq start 1;
create or replace function generate_receipt_number()
returns trigger as $$
begin
  if new.receipt_number is null then
    new.receipt_number := 'RCP-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('receipt_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger auto_receipt_number
  before insert on fee_payments
  for each row execute function generate_receipt_number();

-- Update invoice status after payment
create or replace function update_invoice_status_after_payment()
returns trigger as $$
declare
  v_total_paid numeric;
  v_invoice_amount numeric;
begin
  select coalesce(sum(amount_paid), 0) into v_total_paid
  from fee_payments
  where invoice_id = new.invoice_id;

  select total_amount into v_invoice_amount
  from fee_invoices
  where id = new.invoice_id;

  if v_total_paid >= v_invoice_amount then
    update fee_invoices set status = 'paid' where id = new.invoice_id;
  elsif v_total_paid > 0 then
    update fee_invoices set status = 'partial' where id = new.invoice_id;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_update_invoice_status
  after insert on fee_payments
  for each row execute function update_invoice_status_after_payment();
