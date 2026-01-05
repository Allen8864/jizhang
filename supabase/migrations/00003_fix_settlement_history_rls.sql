-- Fix RLS policy for settlement_history
-- Allow users to create history records for all players in the same room

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can create own history" ON settlement_history;

-- Create new policy that allows creating records for players in the same room
-- The inserting user must be in the same room as the target user
CREATE POLICY "Users can create history for room members" ON settlement_history
    FOR INSERT WITH CHECK (
        -- The target user must be in the same room as the current user
        EXISTS (
            SELECT 1 FROM profiles p1, profiles p2
            WHERE p1.user_id = auth.uid()
              AND p2.user_id = settlement_history.user_id
              AND p1.current_room_id IS NOT NULL
              AND p1.current_room_id = p2.current_room_id
        )
    );
