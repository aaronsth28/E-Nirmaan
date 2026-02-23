-- =============================================================================
-- E-Nirmaan: Construction Management System - Database Schema
-- =============================================================================
-- Users table with role-based access control
-- Roles: ADMIN, STORE_MANAGER, SITE_ENGINEER

-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'STORE_MANAGER', 'SITE_ENGINEER')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

-- =============================================================================
-- SAMPLE DATA (Remove in production)
-- =============================================================================
-- Uncomment to insert test data
-- Password hashes are for "Password123!" with bcrypt
/*
INSERT INTO users (email, first_name, last_name, password_hash, role)
VALUES 
    ('admin@enirmaan.com', 'Admin', 'User', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gBS/O6', 'ADMIN'),
    ('manager@enirmaan.com', 'Store', 'Manager', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gBS/O6', 'STORE_MANAGER'),
    ('engineer@enirmaan.com', 'Site', 'Engineer', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gBS/O6', 'SITE_ENGINEER');
*/

-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
