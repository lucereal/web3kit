
CREATE TABLE auth_nonces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT NOT NULL UNIQUE,
    nonce TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_auth_nonces_wallet_address ON auth_nonces(wallet_address);

CREATE INDEX idx_auth_nonces_expires_at ON auth_nonces(expires_at);

