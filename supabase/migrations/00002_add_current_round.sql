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
