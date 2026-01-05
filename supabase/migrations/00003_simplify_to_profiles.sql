-- Migration: Simplify players table to profiles table
-- A user can only be in one room at a time

-- ============================================
-- STEP 1: Create profiles table
-- ============================================

CREATE TABLE profiles (
    user_id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    avatar_emoji VARCHAR(10) DEFAULT '😀',
    current_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    joined_room_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 2: Migrate data from players to profiles
-- ============================================

-- Insert unique users from players table (take the most recent player record per user)
INSERT INTO profiles (user_id, name, avatar_emoji, current_room_id, joined_room_at, created_at)
SELECT DISTINCT ON (user_id)
    user_id,
    name,
    avatar_emoji,
    room_id,
    created_at,
    created_at
FROM players
WHERE is_active = true
ORDER BY user_id, created_at DESC;

-- ============================================
-- STEP 3: Modify transactions table
-- ============================================

-- Add new columns
ALTER TABLE transactions ADD COLUMN from_user_id UUID;
ALTER TABLE transactions ADD COLUMN to_user_id UUID;

-- Migrate data: map player_id to user_id
UPDATE transactions t
SET from_user_id = p.user_id
FROM players p
WHERE t.from_player_id = p.id;

UPDATE transactions t
SET to_user_id = p.user_id
FROM players p
WHERE t.to_player_id = p.id;

-- Make columns NOT NULL after migration
ALTER TABLE transactions ALTER COLUMN from_user_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN to_user_id SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE transactions
ADD CONSTRAINT fk_from_user FOREIGN KEY (from_user_id) REFERENCES profiles(user_id);

ALTER TABLE transactions
ADD CONSTRAINT fk_to_user FOREIGN KEY (to_user_id) REFERENCES profiles(user_id);

-- Drop old columns and constraints
ALTER TABLE transactions DROP CONSTRAINT transactions_from_player_id_fkey;
ALTER TABLE transactions DROP CONSTRAINT transactions_to_player_id_fkey;
ALTER TABLE transactions DROP COLUMN from_player_id;
ALTER TABLE transactions DROP COLUMN to_player_id;

-- Update check constraint (cannot pay yourself)
ALTER TABLE transactions DROP CONSTRAINT transactions_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_check CHECK (from_user_id != to_user_id);

-- ============================================
-- STEP 4: Drop players table
-- ============================================

DROP TABLE players;

-- ============================================
-- STEP 5: Update RLS policies
-- ============================================

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old helper function
DROP FUNCTION IF EXISTS is_room_member(UUID, UUID);

-- Create new helper function: Check if user is in the room
CREATE OR REPLACE FUNCTION is_room_member(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = user_uuid
        AND current_room_id = room_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view profiles in same room" ON profiles
    FOR SELECT USING (
        current_room_id IS NOT NULL AND
        current_room_id = (SELECT current_room_id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Update transactions policies (already use is_room_member which is updated)

-- ============================================
-- STEP 6: Update indexes
-- ============================================

CREATE INDEX idx_profiles_current_room ON profiles(current_room_id);
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);

-- Drop old indexes
DROP INDEX IF EXISTS idx_players_room_id;
DROP INDEX IF EXISTS idx_players_user_id;

-- ============================================
-- STEP 7: Enable realtime for profiles
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
