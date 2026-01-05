-- Add current_round column to rooms table
-- This persists the round number so it won't be lost when there are consecutive empty rounds

-- Add current_round column with default value of 1
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_round INTEGER NOT NULL DEFAULT 1;

-- Update existing rooms to have current_round based on max round_num from transactions
UPDATE rooms
SET current_round = COALESCE(
    (SELECT MAX(round_num) FROM transactions WHERE transactions.room_id = rooms.id),
    1
);

-- Add countdown_seconds column (null = disabled, number = countdown duration in seconds)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS countdown_seconds INTEGER DEFAULT NULL;

-- Add countdown_end_at column (ISO timestamp when countdown ends, null = no active countdown)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS countdown_end_at TIMESTAMPTZ DEFAULT NULL;

-- Update RLS policy: Allow room members (not just creator) to update room settings
-- Drop the old policy first
DROP POLICY IF EXISTS "Room creator can update" ON rooms;

-- Create new policy allowing room members to update
CREATE POLICY "Room members can update" ON rooms
    FOR UPDATE USING (is_room_member(id, auth.uid()));
