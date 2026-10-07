-- Run automatically by:  npm run db:init
CREATE TABLE IF NOT EXISTS hotels (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  location    VARCHAR(150)  NOT NULL,
  description TEXT          NOT NULL,
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  rating      NUMERIC(2,1)  NOT NULL CHECK (rating >= 0 AND rating <= 5),
  image_path  VARCHAR(255),              -- e.g. /uploads/1718000000-abc123.jpg
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Map coordinates (optional). ADD COLUMN IF NOT EXISTS also upgrades an existing table.
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS latitude  NUMERIC(9,6) CHECK (latitude  BETWEEN -90  AND 90);
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6) CHECK (longitude BETWEEN -180 AND 180);

CREATE INDEX IF NOT EXISTS idx_hotels_name_lower     ON hotels (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_hotels_location_lower ON hotels (LOWER(location));
CREATE INDEX IF NOT EXISTS idx_hotels_price          ON hotels (price);
CREATE INDEX IF NOT EXISTS idx_hotels_rating         ON hotels (rating);
