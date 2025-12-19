-- Add settlement tracking to trips table
ALTER TABLE trips 
ADD COLUMN IF NOT EXISTS weekly_settlement_id uuid REFERENCES settlements(id),
ADD COLUMN IF NOT EXISTS monthly_settlement_id uuid REFERENCES settlements(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_weekly_settlement ON trips(weekly_settlement_id);
CREATE INDEX IF NOT EXISTS idx_trips_monthly_settlement ON trips(monthly_settlement_id);
