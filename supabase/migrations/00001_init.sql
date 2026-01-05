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

-- Transactions table (room_id kept even after room is deleted for history reference)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL, -- No foreign key constraint, keep after room deletion
    from_user_id UUID NOT NULL REFERENCES profiles(user_id),
    to_user_id UUID NOT NULL REFERENCES profiles(user_id),
    amount INTEGER NOT NULL CHECK (amount > 0), -- Stored in cents
    round_num INTEGER NOT NULL DEFAULT 1, -- Round number, starting from 1
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Cannot pay yourself
    CONSTRAINT transactions_no_self_pay CHECK (from_user_id != to_user_id)
);

-- Settlement history table (snapshot of player balances when room is settled)
CREATE TABLE settlement_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(user_id), -- The user who this history belongs to
    room_id UUID NOT NULL, -- Keep room_id for reference (no FK, room may be deleted)
    room_code VARCHAR(4) NOT NULL, -- Copy of room code at settlement time
    settled_at TIMESTAMPTZ DEFAULT NOW(),
    -- Player results snapshot (array of {name, emoji, balance})
    player_results JSONB NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_profiles_current_room ON profiles(current_room_id);
CREATE INDEX idx_transactions_room_id ON transactions(room_id);
CREATE INDEX idx_transactions_round_num ON transactions(round_num);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_settlement_history_user_id ON settlement_history(user_id);
CREATE INDEX idx_settlement_history_room_id ON settlement_history(room_id);
CREATE INDEX idx_settlement_history_settled_at ON settlement_history(settled_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_history ENABLE ROW LEVEL SECURITY;

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

-- Room members can delete room (for settlement)
CREATE POLICY "Room members can delete rooms" ON rooms
    FOR DELETE USING (is_room_member(id, auth.uid()));

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

-- Users can view their own historical transactions (after room is deleted)
CREATE POLICY "Users can view own historical transactions" ON transactions
    FOR SELECT USING (
        from_user_id = auth.uid() OR to_user_id = auth.uid()
    );

-- SETTLEMENT_HISTORY POLICIES
-- Users can create their own history records
CREATE POLICY "Users can create own history" ON settlement_history
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view their own history
CREATE POLICY "Users can view own history" ON settlement_history
    FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for all tables (drop first if exists to avoid errors)
DO $$
BEGIN
    -- Try to add tables to realtime publication
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;

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

-- Get current round number for a room (max round_num from transactions, or 1 if none)
CREATE OR REPLACE FUNCTION get_current_round_num(room_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    max_round INTEGER;
BEGIN
    SELECT COALESCE(MAX(round_num), 1) INTO max_round
    FROM transactions WHERE room_id = room_uuid;
    RETURN max_round;
END;
$$ LANGUAGE plpgsql;
