/*
  # Update bookings table

  1. Changes
    - Update `bookings` table
      - Remove `room_id` column
      - Add `reservation_id` column
      - Add `guest_info` column
      - Add `booking_details` column
      - Add `advance_payment` column
      - Add `total_received` column
      - Add `total_amount` column
      - Add `total_due` column
      - Add `check_in_status` column

  2. Security
    - Update RLS on `bookings` table
    - Update policy for authenticated users to be able to perform all actions
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'bookings') THEN
    CREATE TABLE bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reservation_id TEXT,
      guest_info JSONB,
      booking_details JSONB,
      advance_payment JSONB,
      total_received JSONB,
      total_amount NUMERIC,
      total_due NUMERIC,
      check_in_status BOOLEAN
    );
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Authenticated users can perform all actions" ON bookings FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
  ELSE
    ALTER TABLE bookings DROP COLUMN IF EXISTS room_id;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reservation_id TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_info JSONB;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_details JSONB;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS advance_payment JSONB;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_received JSONB;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_due NUMERIC;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in_status BOOLEAN;
  END IF;
END $$;