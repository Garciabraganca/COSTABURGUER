-- CreateTable
CREATE TABLE "catalog_seed_state" (
    "key" TEXT PRIMARY KEY,
    "done_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at on change (PostgreSQL)
CREATE OR REPLACE FUNCTION set_updated_at_catalog_seed_state() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS catalog_seed_state_set_updated_at ON "catalog_seed_state";
CREATE TRIGGER catalog_seed_state_set_updated_at
BEFORE UPDATE ON "catalog_seed_state"
FOR EACH ROW EXECUTE PROCEDURE set_updated_at_catalog_seed_state();
