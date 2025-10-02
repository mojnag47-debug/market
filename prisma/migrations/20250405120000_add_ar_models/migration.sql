-- Migration: add AR models (ARAsset, ARSession, AREvent)
-- Author: automated-generator
-- Important: This migration creates three tables used for AR features.
-- DBAs: Review FK constraints and storage settings for large JSON fields.

-- Up
BEGIN;

-- Create table for AR assets
CREATE TABLE IF NOT EXISTS public.ar_assets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type TEXT NOT NULL DEFAULT 'GLB',
  file_size INTEGER,
  metadata JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.ar_assets IS 'Stores AR model assets linked to products (GLB/USDZ/etc).';
COMMENT ON COLUMN public.ar_assets.metadata IS 'JSONB metadata for rendering parameters, author, license, etc.';

CREATE INDEX IF NOT EXISTS idx_ar_assets_product_id ON public.ar_assets(product_id);

-- Create table for AR sessions
CREATE TABLE IF NOT EXISTS public.ar_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  product_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  device_info TEXT,
  mode TEXT NOT NULL DEFAULT 'WEBXR',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.ar_sessions IS 'Tracking table for user AR sessions (device, mode, timestamps).';

CREATE INDEX IF NOT EXISTS idx_ar_sessions_user_id ON public.ar_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_product_id ON public.ar_sessions(product_id);

-- Create table for AR events
CREATE TABLE IF NOT EXISTS public.ar_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id TEXT,
  type TEXT NOT NULL,
  payload JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.ar_events IS 'Event log for AR sessions (views, interactions, errors).';

CREATE INDEX IF NOT EXISTS idx_ar_events_session_id ON public.ar_events(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_events_user_id ON public.ar_events(user_id);

-- Foreign keys: reference existing products and users tables
ALTER TABLE public.ar_assets
  ADD CONSTRAINT fk_ar_assets_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.ar_sessions
  ADD CONSTRAINT fk_ar_sessions_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.ar_sessions
  ADD CONSTRAINT fk_ar_sessions_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

ALTER TABLE public.ar_events
  ADD CONSTRAINT fk_ar_events_session FOREIGN KEY (session_id) REFERENCES public.ar_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.ar_events
  ADD CONSTRAINT fk_ar_events_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

COMMIT;

-- Down
-- To rollback: drop events, sessions, assets tables in reverse dependency order
-- BEGIN;
-- ALTER TABLE public.ar_events DROP CONSTRAINT IF EXISTS fk_ar_events_user;
-- ALTER TABLE public.ar_events DROP CONSTRAINT IF EXISTS fk_ar_events_session;
-- DROP INDEX IF EXISTS idx_ar_events_user_id;
-- DROP INDEX IF EXISTS idx_ar_events_session_id;
-- DROP TABLE IF EXISTS public.ar_events;
--
-- ALTER TABLE public.ar_sessions DROP CONSTRAINT IF EXISTS fk_ar_sessions_product;
-- ALTER TABLE public.ar_sessions DROP CONSTRAINT IF EXISTS fk_ar_sessions_user;
-- DROP INDEX IF EXISTS idx_ar_sessions_product_id;
-- DROP INDEX IF EXISTS idx_ar_sessions_user_id;
-- DROP TABLE IF EXISTS public.ar_sessions;
--
-- ALTER TABLE public.ar_assets DROP CONSTRAINT IF EXISTS fk_ar_assets_product;
-- DROP INDEX IF EXISTS idx_ar_assets_product_id;
-- DROP TABLE IF EXISTS public.ar_assets;
-- COMMIT;
-- Migration: add_ar_models
-- Created: 2025-04-05 12:00:00 UTC

-- Up migration
BEGIN;

-- Table: ar_assets
CREATE TABLE IF NOT EXISTS ar_assets (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type TEXT NOT NULL DEFAULT 'GLB',
  file_size INTEGER,
  metadata JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP(3) DEFAULT now() NOT NULL,
  updated_at TIMESTAMP(3) DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ar_assets_product_id ON ar_assets (product_id);
COMMENT ON TABLE ar_assets IS 'Stores AR asset references for products (GLB, USDZ, etc.)';

-- Table: ar_sessions
CREATE TABLE IF NOT EXISTS ar_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  product_id TEXT,
  started_at TIMESTAMP(3) DEFAULT now() NOT NULL,
  ended_at TIMESTAMP(3),
  device_info TEXT,
  mode TEXT NOT NULL DEFAULT 'WEBXR',
  metadata JSONB,
  created_at TIMESTAMP(3) DEFAULT now() NOT NULL,
  updated_at TIMESTAMP(3) DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_user_id ON ar_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_product_id ON ar_sessions (product_id);
COMMENT ON TABLE ar_sessions IS 'Tracks AR viewing sessions per user/product.';

-- Table: ar_events
CREATE TABLE IF NOT EXISTS ar_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  type TEXT NOT NULL,
  payload JSONB,
  occurred_at TIMESTAMP(3) DEFAULT now() NOT NULL,
  created_at TIMESTAMP(3) DEFAULT now() NOT NULL,
  updated_at TIMESTAMP(3) DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ar_events_session_id ON ar_events (session_id);
CREATE INDEX IF NOT EXISTS idx_ar_events_user_id ON ar_events (user_id);
COMMENT ON TABLE ar_events IS 'Event log for AR interactions and telemetry.';

-- Foreign keys
ALTER TABLE ar_assets
  ADD CONSTRAINT fk_ar_assets_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE ar_sessions
  ADD CONSTRAINT fk_ar_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ar_sessions
  ADD CONSTRAINT fk_ar_sessions_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

ALTER TABLE ar_events
  ADD CONSTRAINT fk_ar_events_session_id FOREIGN KEY (session_id) REFERENCES ar_sessions(id) ON DELETE CASCADE;
ALTER TABLE ar_events
  ADD CONSTRAINT fk_ar_events_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

COMMIT;

-- Down migration (rollback)
-- Note for DBAs: Dropping tables will remove AR history. Consider archiving before rollback.

BEGIN;
DROP TABLE IF EXISTS ar_events;
DROP TABLE IF EXISTS ar_sessions;
DROP TABLE IF EXISTS ar_assets;
COMMIT;
