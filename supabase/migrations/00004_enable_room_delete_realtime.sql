-- Enable full row data for realtime events
-- By default, Supabase realtime doesn't send old row data on UPDATE/DELETE
-- Setting REPLICA IDENTITY FULL allows the old row data to be sent

ALTER TABLE rooms REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;
