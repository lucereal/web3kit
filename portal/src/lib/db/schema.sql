
ALTER DATABASE postgres SET row_security = on;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE resource (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resource_id TEXT NOT NULL UNIQUE, 
    seller_wallet TEXT NOT NULL,
    service_id TEXT NOT NULL,
    resource_type INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    cid TEXT,
    url TEXT,
    price_wei TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at INTEGER DEFAULT EXTRACT(EPOCH FROM NOW()) NOT NULL,
);

CREATE TABLE access (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resource_id TEXT NOT NULL REFERENCES resource(resource_id),
    buyer_wallet TEXT NOT NULL,
    amount_paid_wei TEXT NOT NULL DEFAULT '0',
    purchased_at INTEGER NOT NULL, -- Unix timestamp in seconds
    UNIQUE(resource_id, buyer_wallet)
);

CREATE INDEX idx_resource_resource_id ON resource(resource_id);
CREATE INDEX idx_resource_seller ON resource(seller_wallet);
CREATE INDEX idx_resource_service ON resource(service_id);
CREATE INDEX idx_resource_type ON resource(resource_type);
CREATE INDEX idx_resource_active ON resource(is_active);
CREATE INDEX idx_access_resource ON access(resource_id);
CREATE INDEX idx_access_buyer ON access(buyer_wallet);
CREATE INDEX idx_access_composite ON access(resource_id, buyer_wallet);


CREATE POLICY "System can manage access" ON access
    FOR ALL USING (current_setting('role', true) = 'service_role');

