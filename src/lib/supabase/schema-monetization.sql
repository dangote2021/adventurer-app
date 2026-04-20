-- ============================================================================
-- ADVENTURER - Monetization & Growth Schema (Migration v2)
-- Run this in the Supabase SQL Editor AFTER the initial schema.sql
-- Idempotent: safe to re-run.
-- ============================================================================

-- ============================================================================
-- COACHES (extension of profiles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  sports TEXT[] NOT NULL DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',           -- e.g. {'AIDA Instructor', 'IFMGA', 'PADI'}
  languages TEXT[] DEFAULT '{fr}',
  base_location TEXT,
  hourly_rate_cents INTEGER NOT NULL DEFAULT 6500,  -- 65.00 EUR
  currency TEXT NOT NULL DEFAULT 'eur',
  is_published BOOLEAN DEFAULT FALSE,           -- visible in CoachHub only when true
  is_verified BOOLEAN DEFAULT FALSE,            -- manual verification by Adventurer team
  stripe_account_id TEXT,                       -- Stripe Connect account (acct_xxx)
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  stripe_charges_enabled BOOLEAN DEFAULT FALSE,
  stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
  rating_avg NUMERIC(2,1),                      -- computed from reviews
  review_count INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coaches_sports ON coaches USING GIN(sports);
CREATE INDEX IF NOT EXISTS idx_coaches_published ON coaches(is_published) WHERE is_published = TRUE;

-- ============================================================================
-- COACH BOOKINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS coach_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  client_id UUID NOT NULL REFERENCES profiles(id),
  sport TEXT NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  location TEXT,                                -- "Tarifa, ES" or "Online"
  meeting_url TEXT,                             -- Jitsi / Google Meet
  client_note TEXT,
  price_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,          -- 15% commission
  coach_payout_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'confirmed', 'completed', 'cancelled', 'refunded', 'disputed'
  )),
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_client ON coach_bookings(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_coach ON coach_bookings(coach_id, session_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON coach_bookings(status);

-- ============================================================================
-- COACH REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS coach_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES coach_bookings(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coaches(id),
  client_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- ============================================================================
-- MARKETPLACE ORDERS
-- ============================================================================

-- Extend market_items if needed (idempotent)
ALTER TABLE market_items ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE market_items ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE market_items ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE market_items ADD COLUMN IF NOT EXISTS shipping_available BOOLEAN DEFAULT FALSE;
ALTER TABLE market_items ADD COLUMN IF NOT EXISTS shipping_cost_cents INTEGER DEFAULT 0;
ALTER TABLE market_items ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES market_items(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  price_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  platform_fee_cents INTEGER NOT NULL,          -- 5% commission
  seller_payout_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'disputed'
  )),
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  shipping_address JSONB,
  tracking_number TEXT,
  buyer_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_orders_buyer ON marketplace_orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_orders_seller ON marketplace_orders(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_orders_status ON marketplace_orders(status);

-- ============================================================================
-- SELLERS (Stripe Connect for marketplace payouts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS seller_accounts (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id TEXT UNIQUE,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  stripe_charges_enabled BOOLEAN DEFAULT FALSE,
  stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AMBASSADORS PROGRAM
-- ============================================================================

CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),         -- null if not yet signed up
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  sport TEXT NOT NULL,                          -- primary sport
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  instagram_handle TEXT,
  strava_link TEXT,
  youtube_link TEXT,
  audience_size INTEGER,
  referral_code TEXT UNIQUE NOT NULL,           -- e.g. 'SOFIA-KITE'
  status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN (
    'prospect', 'contacted', 'onboarding', 'active', 'paused', 'churned'
  )),
  contacted_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  notes TEXT,
  total_referrals INTEGER DEFAULT 0,
  total_commission_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ambassadors_code ON ambassadors(referral_code);
CREATE INDEX IF NOT EXISTS idx_ambassadors_status ON ambassadors(status);

CREATE TABLE IF NOT EXISTS ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ambassador_id UUID NOT NULL REFERENCES ambassadors(id),
  referred_user_id UUID NOT NULL REFERENCES profiles(id),
  source TEXT,                                  -- 'signup', 'booking', 'marketplace'
  commission_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ambassador_id, referred_user_id)
);

-- ============================================================================
-- PAYOUT LEDGER (for accounting & transparency)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payout_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES profiles(id),     -- coach or seller
  kind TEXT NOT NULL CHECK (kind IN ('coach_session', 'marketplace_sale', 'ambassador_referral', 'refund', 'adjustment')),
  reference_id UUID,                                    -- booking_id, order_id, etc.
  amount_cents INTEGER NOT NULL,                        -- positive = credit, negative = debit
  platform_fee_cents INTEGER DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid_out', 'failed')),
  stripe_transfer_id TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ledger_account ON payout_ledger(account_id, created_at DESC);

-- ============================================================================
-- WAITLIST (for rental feature & new sports)
-- ============================================================================

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  feature TEXT NOT NULL,                        -- 'marketplace_rent', 'coaching_free_dive', etc.
  locale TEXT DEFAULT 'fr',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, feature)
);

-- ============================================================================
-- NEWSLETTER / EMAIL CAPTURE
-- ============================================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,                                  -- 'landing', 'onboarding', 'ambassador'
  sports TEXT[] DEFAULT '{}',
  locale TEXT DEFAULT 'fr',
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Coaches: published coaches visible to all; owner can update
DROP POLICY IF EXISTS "Published coaches viewable" ON coaches;
CREATE POLICY "Published coaches viewable" ON coaches FOR SELECT USING (is_published = TRUE OR auth.uid() = id);
DROP POLICY IF EXISTS "Coaches manage own profile" ON coaches;
CREATE POLICY "Coaches manage own profile" ON coaches FOR ALL USING (auth.uid() = id);

-- Bookings: visible to coach or client
DROP POLICY IF EXISTS "Bookings visible to participants" ON coach_bookings;
CREATE POLICY "Bookings visible to participants" ON coach_bookings FOR SELECT USING (
  auth.uid() = client_id OR auth.uid() = coach_id
);
DROP POLICY IF EXISTS "Clients create bookings" ON coach_bookings;
CREATE POLICY "Clients create bookings" ON coach_bookings FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Reviews: public read, only client-of-booking can create
DROP POLICY IF EXISTS "Reviews viewable by everyone" ON coach_reviews;
CREATE POLICY "Reviews viewable by everyone" ON coach_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "Clients write reviews" ON coach_reviews;
CREATE POLICY "Clients write reviews" ON coach_reviews FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Marketplace orders: visible to buyer or seller
DROP POLICY IF EXISTS "Orders visible to participants" ON marketplace_orders;
CREATE POLICY "Orders visible to participants" ON marketplace_orders FOR SELECT USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);
DROP POLICY IF EXISTS "Buyers create orders" ON marketplace_orders;
CREATE POLICY "Buyers create orders" ON marketplace_orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Seller accounts: only owner
DROP POLICY IF EXISTS "Sellers manage own account" ON seller_accounts;
CREATE POLICY "Sellers manage own account" ON seller_accounts FOR ALL USING (auth.uid() = id);

-- Ambassadors: only admin / self
DROP POLICY IF EXISTS "Ambassadors see own record" ON ambassadors;
CREATE POLICY "Ambassadors see own record" ON ambassadors FOR SELECT USING (auth.uid() = user_id);

-- Waitlist & newsletter: insert-only for anonymous, no read
DROP POLICY IF EXISTS "Anyone can join waitlist" ON waitlist;
CREATE POLICY "Anyone can join waitlist" ON waitlist FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can subscribe newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE TRIGGER update_coaches_timestamp BEFORE UPDATE ON coaches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER update_bookings_timestamp BEFORE UPDATE ON coach_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER update_orders_timestamp BEFORE UPDATE ON marketplace_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER update_seller_accounts_timestamp BEFORE UPDATE ON seller_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER update_ambassadors_timestamp BEFORE UPDATE ON ambassadors FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-compute coach rating & review_count
CREATE OR REPLACE FUNCTION recompute_coach_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE coaches SET
    rating_avg = (SELECT AVG(rating)::NUMERIC(2,1) FROM coach_reviews WHERE coach_id = NEW.coach_id),
    review_count = (SELECT COUNT(*) FROM coach_reviews WHERE coach_id = NEW.coach_id),
    updated_at = NOW()
  WHERE id = NEW.coach_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_coach_review_insert ON coach_reviews;
CREATE TRIGGER trg_coach_review_insert AFTER INSERT ON coach_reviews FOR EACH ROW EXECUTE FUNCTION recompute_coach_rating();
