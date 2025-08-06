-- Azula Unlockr Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create the tables

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET row_security = on;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: seller_meta
-- Stores seller information and encrypted API keys
-- CREATE TABLE seller_meta (
--     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
--     wallet_address TEXT NOT NULL UNIQUE,
--     encrypted_api_keys JSONB DEFAULT '{}',
--     total_resources INTEGER DEFAULT 0,
--     total_earnings_wei TEXT DEFAULT '0',
--     is_verified BOOLEAN DEFAULT false,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Table: resource_meta
-- Stores resource metadata and configuration
CREATE TABLE resource_meta (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resource_id TEXT NOT NULL UNIQUE, -- From blockchain
    seller_wallet TEXT NOT NULL,
    service_id TEXT NOT NULL,
    resource_type INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    cid TEXT,
    url TEXT,
    price_wei TEXT NOT NULL,
    default_usage INTEGER NOT NULL DEFAULT 100,
    default_expiry_seconds INTEGER NOT NULL DEFAULT 3600,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    deactivated_at INTEGER, -- Unix timestamp in seconds
    deleted_at INTEGER, -- Unix timestamp in seconds
    created_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW()) NOT NULL,
    updated_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW()) NOT NULL
);

-- Table: access_meta
-- Stores access grants and usage tracking
CREATE TABLE access_meta (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resource_id TEXT NOT NULL REFERENCES resource_meta(resource_id),
    buyer_wallet TEXT NOT NULL,
    usage_limit INTEGER NOT NULL DEFAULT 0,
    amount_paid_wei TEXT NOT NULL DEFAULT '0',
    purchased_at INTEGER NOT NULL, -- Unix timestamp in seconds
    expires_at INTEGER NOT NULL, -- Unix timestamp in seconds
    created_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW()) NOT NULL,
    updated_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW()) NOT NULL,
    UNIQUE(resource_id, buyer_wallet)
);

-- Indexes for performance
-- CREATE INDEX idx_seller_meta_wallet ON seller_meta(wallet_address);
CREATE INDEX idx_resource_meta_resource_id ON resource_meta(resource_id);
CREATE INDEX idx_resource_meta_seller ON resource_meta(seller_wallet);
CREATE INDEX idx_resource_meta_service ON resource_meta(service_id);
CREATE INDEX idx_resource_meta_type ON resource_meta(resource_type);
CREATE INDEX idx_resource_meta_active ON resource_meta(is_active);
CREATE INDEX idx_access_meta_resource ON access_meta(resource_id);
CREATE INDEX idx_access_meta_buyer ON access_meta(buyer_wallet);
CREATE INDEX idx_access_meta_expires ON access_meta(expires_at);
CREATE INDEX idx_access_meta_composite ON access_meta(resource_id, buyer_wallet);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = EXTRACT(EPOCH FROM NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
-- CREATE TRIGGER update_seller_meta_updated_at BEFORE UPDATE ON seller_meta
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_meta_updated_at BEFORE UPDATE ON resource_meta
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_meta_updated_at BEFORE UPDATE ON access_meta
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
-- These can be customized based on your security requirements

-- Seller meta: Users can only see their own data
-- ALTER TABLE seller_meta ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own seller data" ON seller_meta
--     FOR SELECT USING (wallet_address = current_setting('app.current_user_wallet', true));

-- CREATE POLICY "Users can update own seller data" ON seller_meta
--     FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet', true));

-- CREATE POLICY "Users can insert own seller data" ON seller_meta
--     FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_user_wallet', true));

-- -- Resource meta: Public read for active resources, owners can manage their own
-- ALTER TABLE resource_meta ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Anyone can view active resources" ON resource_meta
--     FOR SELECT USING (is_active = true);

-- CREATE POLICY "Sellers can view own resources" ON resource_meta
--     FOR SELECT USING (seller_wallet = current_setting('app.current_user_wallet', true));

-- CREATE POLICY "Sellers can manage own resources" ON resource_meta
--     FOR ALL USING (seller_wallet = current_setting('app.current_user_wallet', true));

-- -- Access meta: Users can see their own access, sellers can see access to their resources
-- ALTER TABLE access_meta ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own access" ON access_meta
--     FOR SELECT USING (buyer_wallet = current_setting('app.current_user_wallet', true));

-- CREATE POLICY "Sellers can view access to their resources" ON access_meta
--     FOR SELECT USING (
--         resource_id IN (
--             SELECT resource_id FROM resource_meta 
--             WHERE seller_wallet = current_setting('app.current_user_wallet', true)
--         )
--     );

-- Only the system can insert/update access records (via service role)
CREATE POLICY "System can manage access" ON access_meta
    FOR ALL USING (current_setting('role', true) = 'service_role');

-- Views for common queries
-- CREATE VIEW active_resources AS
-- SELECT 
--     rm.*,
--     sm.is_verified as seller_verified,
--     COALESCE(access_stats.active_users, 0) as active_users,
--     COALESCE(access_stats.total_access_grants, 0) as total_access_grants
-- FROM resource_meta rm
-- JOIN seller_meta sm ON rm.seller_wallet = sm.wallet_address
-- LEFT JOIN (
--     SELECT 
--         resource_id,
--         COUNT(CASE WHEN expires_at > EXTRACT(EPOCH FROM NOW()) AND usage_left > 0 THEN 1 END) as active_users,
--         COUNT(*) as total_access_grants
--     FROM access_meta
--     GROUP BY resource_id
-- ) access_stats ON rm.resource_id = access_stats.resource_id
-- WHERE rm.is_active = true;

-- CREATE VIEW seller_dashboard AS
-- SELECT 
--     sm.*,
--     COUNT(rm.id) as total_resources,
--     COUNT(CASE WHEN rm.is_active THEN 1 END) as active_resources,
--     COALESCE(SUM(CASE WHEN am.expires_at > EXTRACT(EPOCH FROM NOW()) AND am.usage_left > 0 THEN 1 ELSE 0 END), 0) as active_access_grants
-- FROM seller_meta sm
-- LEFT JOIN resource_meta rm ON sm.wallet_address = rm.seller_wallet
-- LEFT JOIN access_meta am ON rm.resource_id = am.resource_id
-- GROUP BY sm.id, sm.wallet_address, sm.encrypted_api_keys, sm.total_resources, sm.total_earnings_wei, sm.is_verified, sm.created_at, sm.updated_at;

-- Function for cleanup expired access (can be called via cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_access()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM access_meta 
    WHERE expires_at < EXTRACT(EPOCH FROM NOW());
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a function to execute raw SQL (for advanced queries)
-- CREATE OR REPLACE FUNCTION execute_sql(query TEXT, params TEXT[] DEFAULT '{}')
-- RETURNS TABLE(result JSONB) AS $$
-- BEGIN
--     -- This is a simplified version - in production you'd want more safety checks
--     RETURN QUERY EXECUTE query USING VARIADIC params;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample data (optional, for testing)
-- Uncomment if you want sample data

/*
-- Sample seller
INSERT INTO seller_meta (wallet_address, encrypted_api_keys, is_verified) VALUES
('0x72c157962b1f6df1ffcbec32dfab0bee93a6e433', '{"openai": "encrypted_key_here"}', true);

-- Sample resource
INSERT INTO resource_meta (resource_id, seller_wallet, service, name, description, price_wei, default_usage, default_expiry_seconds) VALUES
('openai-access-1', '0x72c157962b1f6df1ffcbec32dfab0bee93a6e433', 'openai', 'GPT-4 Access', 'Access to GPT-4 API', '1000000000000000000', 100, 3600);

-- Sample access
INSERT INTO access_meta (resource_id, buyer_wallet, usage_left, expires_at) VALUES
('openai-access-1', '0x2345db790dc27940182ad9bb20c5ff1e46b0b466', 50, EXTRACT(EPOCH FROM NOW() + INTERVAL '1 hour'));
*/
