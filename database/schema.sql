-- BioPOS AuthBridge MVP Database Schema

CREATE TABLE merchants (
    merchant_id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    risk_tier VARCHAR(16) NOT NULL CHECK (risk_tier IN ('low', 'medium', 'high')),
    status VARCHAR(16) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE terminals (
    terminal_id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(merchant_id),
    device_serial VARCHAR(128) NOT NULL,
    biometric_capable BOOLEAN NOT NULL DEFAULT FALSE,
    trust_status VARCHAR(16) NOT NULL DEFAULT 'trusted',
    firmware_version VARCHAR(64),
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
    customer_ref VARCHAR(64) PRIMARY KEY,
    kyc_tier INTEGER NOT NULL DEFAULT 0,
    account_linked BOOLEAN NOT NULL DEFAULT FALSE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    biometric_enrollment_id VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE authorization_requests (
    request_id VARCHAR(64) PRIMARY KEY,
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(merchant_id),
    terminal_id VARCHAR(64) NOT NULL REFERENCES terminals(terminal_id),
    customer_ref VARCHAR(64) NOT NULL REFERENCES customers(customer_ref),
    amount NUMERIC(18,2) NOT NULL,
    currency VARCHAR(8) NOT NULL,
    transaction_type VARCHAR(32) NOT NULL,
    biometric_proof_token TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    reason_code VARCHAR(64),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE consent_artifacts (
    consent_id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) NOT NULL REFERENCES authorization_requests(request_id),
    customer_ref VARCHAR(64) NOT NULL REFERENCES customers(customer_ref),
    merchant_id VARCHAR(64) NOT NULL REFERENCES merchants(merchant_id),
    terminal_id VARCHAR(64) NOT NULL REFERENCES terminals(terminal_id),
    policy_outcome VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE policy_decisions (
    decision_id BIGSERIAL PRIMARY KEY,
    request_id VARCHAR(64) NOT NULL REFERENCES authorization_requests(request_id),
    approved BOOLEAN NOT NULL,
    aml_flag BOOLEAN NOT NULL DEFAULT FALSE,
    risk_score INTEGER NOT NULL,
    reason_code VARCHAR(64),
    decision_payload JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE settlement_events (
    settlement_id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) NOT NULL REFERENCES authorization_requests(request_id),
    provider_name VARCHAR(64) NOT NULL,
    provider_reference VARCHAR(128),
    settlement_status VARCHAR(20) NOT NULL,
    amount NUMERIC(18,2) NOT NULL,
    currency VARCHAR(8) NOT NULL,
    callback_payload JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
