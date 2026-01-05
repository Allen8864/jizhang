-- Function to cleanup expired rooms (inactive for 3 hours)
-- If room has transactions: create settlement history then delete
-- If room has no transactions: directly delete

CREATE OR REPLACE FUNCTION cleanup_expired_rooms()
RETURNS TABLE (
    deleted_room_id UUID,
    room_code VARCHAR(4),
    had_transactions BOOLEAN,
    player_count INTEGER
) AS $$
DECLARE
    expired_room RECORD;
    room_players RECORD;
    player_results JSONB;
    balance_map JSONB;
BEGIN
    -- Find rooms not updated in 3 hours
    FOR expired_room IN
        SELECT r.id, r.code
        FROM rooms r
        WHERE r.updated_at < NOW() - INTERVAL '3 hours'
    LOOP
        -- Get players in this room
        SELECT
            array_agg(p.user_id) as user_ids,
            count(*) as count
        INTO room_players
        FROM profiles p
        WHERE p.current_room_id = expired_room.id;

        -- Check if room has transactions
        IF EXISTS (SELECT 1 FROM transactions t WHERE t.room_id = expired_room.id) THEN
            -- Calculate balances for each player
            SELECT jsonb_object_agg(
                user_id,
                COALESCE(
                    (SELECT SUM(CASE
                        WHEN t.to_user_id = p.user_id THEN t.amount
                        WHEN t.from_user_id = p.user_id THEN -t.amount
                        ELSE 0
                    END)
                    FROM transactions t
                    WHERE t.room_id = expired_room.id
                    AND (t.from_user_id = p.user_id OR t.to_user_id = p.user_id)),
                    0
                )
            )
            INTO balance_map
            FROM profiles p
            WHERE p.current_room_id = expired_room.id;

            -- Build player results JSON array
            SELECT jsonb_agg(
                jsonb_build_object(
                    'user_id', p.user_id,
                    'name', p.name,
                    'emoji', p.avatar_emoji,
                    'balance', COALESCE((balance_map->>p.user_id::text)::integer, 0)
                )
            )
            INTO player_results
            FROM profiles p
            WHERE p.current_room_id = expired_room.id;

            -- Create settlement history for each player
            INSERT INTO settlement_history (user_id, room_id, room_code, player_results)
            SELECT p.user_id, expired_room.id, expired_room.code, player_results
            FROM profiles p
            WHERE p.current_room_id = expired_room.id;

            -- Return info
            deleted_room_id := expired_room.id;
            room_code := expired_room.code;
            had_transactions := TRUE;
            player_count := COALESCE(room_players.count, 0);
            RETURN NEXT;
        ELSE
            -- No transactions, just delete
            deleted_room_id := expired_room.id;
            room_code := expired_room.code;
            had_transactions := FALSE;
            player_count := COALESCE(room_players.count, 0);
            RETURN NEXT;
        END IF;

        -- Delete the room (this will SET NULL on profiles.current_room_id via FK)
        DELETE FROM rooms WHERE id = expired_room.id;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- To schedule automatic cleanup, you have these options:
-- 1. Supabase Pro: Use pg_cron extension
-- 2. Free: Use external cron service (cron-job.org) to call your API
-- 3. Free: Manually run: SELECT cleanup_expired_rooms()
