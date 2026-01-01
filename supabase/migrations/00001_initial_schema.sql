-- 记账 (Jizhang) - Card Game/Mahjong Accounting System
-- Initial Database Schema with RLS Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Rooms table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(6) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT '新房间',
    created_by_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table (room membership)
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,
    avatar_color VARCHAR(7) DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Each user can only join a room once
    UNIQUE(room_id, user_id)
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
    from_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    to_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0), -- Stored in cents
    note VARCHAR(200),
    round_id UUID REFERENCES rounds(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID NOT NULL,

    -- Cannot pay yourself
    CHECK (from_player_id != to_player_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_transactions_room_id ON transactions(room_id);
CREATE INDEX idx_transactions_round_id ON transactions(round_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_rounds_room_id ON rounds(room_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is a member of a room
CREATE OR REPLACE FUNCTION is_room_member(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM players
        WHERE room_id = room_uuid
        AND user_id = user_uuid
        AND is_active = TRUE
    );
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

-- PLAYERS POLICIES
-- Anyone authenticated can join a room (create player record)
CREATE POLICY "Authenticated users can join rooms" ON players
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND user_id = auth.uid()
    );

-- Room members can view all players in their rooms
CREATE POLICY "Room members can view players" ON players
    FOR SELECT USING (
        is_room_member(room_id, auth.uid()) OR user_id = auth.uid()
    );

-- Players can update their own record
CREATE POLICY "Players can update own record" ON players
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
        is_room_member(room_id, auth.uid()) AND created_by_user_id = auth.uid()
    );

-- Room members can view transactions
CREATE POLICY "Room members can view transactions" ON transactions
    FOR SELECT USING (
        is_room_member(room_id, auth.uid())
    );

-- Transaction creator can delete within 5 minutes
CREATE POLICY "Creator can delete recent transactions" ON transactions
    FOR DELETE USING (
        created_by_user_id = auth.uid() AND
        created_at > NOW() - INTERVAL '5 minutes'
    );

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate unique 6-character room code
-- Excludes confusing characters: 0/O, 1/I/l
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    chars VARCHAR := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    code VARCHAR(6) := '';
    i INTEGER;
BEGIN
    LOOP
        code := '';
        FOR i IN 1..6 LOOP
            code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;

        -- Check if code already exists
        IF NOT EXISTS (SELECT 1 FROM rooms WHERE rooms.code = generate_room_code.code) THEN
            RETURN code;
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
