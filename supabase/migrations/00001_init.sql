-- 记账 (Jizhang) - Card Game/Mahjong Accounting System
-- Complete Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(4) UNIQUE NOT NULL,
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (one user can only be in one room at a time)
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    avatar_emoji VARCHAR(10) DEFAULT '😀',
    current_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    joined_room_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rounds table
CREATE TABLE rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    index INTEGER NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,

    -- Round index must be unique per room
    UNIQUE(room_id, index)
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES profiles(user_id),
    to_user_id UUID NOT NULL REFERENCES profiles(user_id),
    amount INTEGER NOT NULL CHECK (amount > 0), -- Stored in cents
    round_id UUID REFERENCES rounds(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Cannot pay yourself
    CONSTRAINT transactions_no_self_pay CHECK (from_user_id != to_user_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_profiles_current_room ON profiles(current_room_id);
CREATE INDEX idx_transactions_room_id ON transactions(room_id);
CREATE INDEX idx_transactions_round_id ON transactions(round_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_rounds_room_id ON rounds(room_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's current room id (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_room_id(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    room_id UUID;
BEGIN
    SELECT current_room_id INTO room_id FROM profiles WHERE user_id = user_uuid;
    RETURN room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user is a member of a room
CREATE OR REPLACE FUNCTION is_room_member(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_room_id(user_uuid) = room_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user is the room creator
CREATE OR REPLACE FUNCTION is_room_creator(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM rooms
        WHERE id = room_uuid
        AND created_by_user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ROOMS POLICIES
-- Anyone authenticated can create a room
CREATE POLICY "Anyone can create rooms" ON rooms
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Room members and creator can view the room
CREATE POLICY "Room members can view rooms" ON rooms
    FOR SELECT USING (
        is_room_member(id, auth.uid()) OR created_by_user_id = auth.uid()
    );

-- Anyone can view a room by code (for joining)
CREATE POLICY "Anyone can lookup room by code" ON rooms
    FOR SELECT USING (true);

-- Only creator can update room
CREATE POLICY "Room creator can update" ON rooms
    FOR UPDATE USING (created_by_user_id = auth.uid());

-- PROFILES POLICIES
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (user_id = auth.uid());

-- Users can view profiles in same room (use function to avoid recursion)
CREATE POLICY "Users can view profiles in same room" ON profiles
    FOR SELECT USING (
        current_room_id IS NOT NULL AND
        current_room_id = get_user_room_id(auth.uid())
    );

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (user_id = auth.uid());

-- ROUNDS POLICIES
-- Room members can create rounds
CREATE POLICY "Room members can create rounds" ON rounds
    FOR INSERT WITH CHECK (
        is_room_member(room_id, auth.uid())
    );

-- Room members can view rounds
CREATE POLICY "Room members can view rounds" ON rounds
    FOR SELECT USING (
        is_room_member(room_id, auth.uid())
    );

-- Room members can update rounds (end them)
CREATE POLICY "Room members can update rounds" ON rounds
    FOR UPDATE USING (
        is_room_member(room_id, auth.uid())
    );

-- TRANSACTIONS POLICIES
-- Room members can create transactions
CREATE POLICY "Room members can create transactions" ON transactions
    FOR INSERT WITH CHECK (
        is_room_member(room_id, auth.uid())
    );

-- Room members can view transactions
CREATE POLICY "Room members can view transactions" ON transactions
    FOR SELECT USING (
        is_room_member(room_id, auth.uid())
    );

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate unique 4-digit room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(4) AS $$
DECLARE
    new_code VARCHAR(4) := '';
BEGIN
    LOOP
        new_code := lpad(floor(random() * 9000 + 1000)::text, 4, '0');

        -- Check if code already exists
        IF NOT EXISTS (SELECT 1 FROM rooms WHERE rooms.code = new_code) THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Get next round index for a room
CREATE OR REPLACE FUNCTION get_next_round_index(room_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    max_index INTEGER;
BEGIN
    SELECT COALESCE(MAX(index), 0) INTO max_index
    FROM rounds WHERE room_id = room_uuid;
    RETURN max_index + 1;
END;
$$ LANGUAGE plpgsql;
