-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Drivers Table
create table if not exists drivers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  payment_mode text not null default 'BATTA' check (payment_mode in ('BATTA', 'SALARY', 'SPLIT'))
);

-- Routes Table
create table if not exists routes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  origin text,
  destination text,
  batta_amount numeric default 0,
  salary_amount numeric default 0
);

-- Trips Table
create table if not exists trips (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  trip_date date not null,
  driver_id uuid references drivers(id),
  route_id uuid references routes(id)
);

-- Settlements Table
create table if not exists settlements (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  driver_id uuid references drivers(id),
  amount numeric not null,
  type text not null,
  start_date date,
  end_date date
);

-- Add some dummy routes if none exist
insert into routes (name, origin, destination, batta_amount, salary_amount)
select 'Chennai - BLR', 'Chennai', 'Bangalore', 1500, 500
where not exists (select 1 from routes);

insert into routes (name, origin, destination, batta_amount, salary_amount)
select 'Chennai - HYD', 'Chennai', 'Hyderabad', 2000, 800
where not exists (select 1 from routes);
