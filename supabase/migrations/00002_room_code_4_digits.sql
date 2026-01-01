-- Change room code from 6 alphanumeric characters to 4 digits

-- First, delete all existing rooms (and cascaded players/transactions)
-- since old 6-char codes are incompatible with new 4-digit format
DELETE FROM rooms;

-- Update column type
ALTER TABLE rooms ALTER COLUMN code TYPE VARCHAR(4);

-- Update the generate_room_code function to generate 4 digit codes
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
