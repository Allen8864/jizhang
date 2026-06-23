-- Dedicated table for scheduled keep-alive reads.
-- GitHub Actions pings this table so maintenance jobs do not touch business data.

CREATE TABLE IF NOT EXISTS public.keep_alive (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.keep_alive TO service_role;

INSERT INTO public.keep_alive (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
