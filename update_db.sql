-- Add payment_mode to drivers if it doesn't exist
alter table drivers 
add column if not exists payment_mode text not null default 'BATTA';

-- Update the check constraint to be sure
alter table drivers drop constraint if exists drivers_payment_mode_check;
alter table drivers add constraint drivers_payment_mode_check check (payment_mode in ('BATTA', 'SALARY', 'SPLIT'));

-- Ensure routes table has correct columns
alter table routes 
add column if not exists batta_amount numeric default 0,
add column if not exists salary_amount numeric default 0;

-- Ensure settlements table exists and has correct columns
create table if not exists settlements (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  driver_id uuid references drivers(id),
  amount numeric not null,
  type text not null,
  start_date date,
  end_date date
);

-- Reload Schema Cache (Notify PostgREST)
NOTIFY pgrst, 'reload schema';
