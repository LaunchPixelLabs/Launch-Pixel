-- Certificate Verification System Migration
-- Run this to create all certificate-related tables

-- 1. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  verification_id VARCHAR(64) UNIQUE NOT NULL,
  
  -- Candidate Information
  candidate_id INTEGER REFERENCES agent_contacts(id) ON DELETE SET NULL,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255),
  candidate_phone VARCHAR(50),
  
  -- Certificate Details
  certificate_type VARCHAR(100) NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  program_duration VARCHAR(100),
  issue_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP,
  
  -- Performance & Skills
  grade VARCHAR(50),
  skills_acquired TEXT,
  projects_completed TEXT,
  performance_notes TEXT,
  
  -- Issuer Information
  issued_by VARCHAR(255) NOT NULL DEFAULT 'Launch Pixel',
  issuer_title VARCHAR(255),
  issuer_signature TEXT,
  
  -- Verification & Security
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  verification_count INTEGER DEFAULT 0,
  last_verified_at TIMESTAMP,
  
  -- QR Code & URLs
  qr_code_url TEXT,
  public_verification_url TEXT,
  
  -- Metadata
  metadata TEXT,
  notes TEXT,
  
  -- Audit Trail
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  revoked_by VARCHAR(255),
  revoked_reason TEXT
);

-- Index for fast verification lookups
CREATE INDEX idx_certificates_verification_id ON certificates(verification_id);
CREATE INDEX idx_certificates_candidate_name ON certificates(candidate_name);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_type ON certificates(certificate_type);
CREATE INDEX idx_certificates_created_at ON certificates(created_at DESC);

-- 2. Certificate Verification Logs Table
CREATE TABLE IF NOT EXISTS certificate_verification_logs (
  id SERIAL PRIMARY KEY,
  certificate_id INTEGER REFERENCES certificates(id) ON DELETE CASCADE,
  verification_id VARCHAR(64) NOT NULL,
  
  -- Verification Details
  verified_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  location VARCHAR(255),
  
  -- Verification Result
  status VARCHAR(50) NOT NULL,
  
  -- Additional Context
  verified_by VARCHAR(255),
  purpose VARCHAR(100),
  notes TEXT
);

-- Index for fast log lookups
CREATE INDEX idx_verification_logs_certificate_id ON certificate_verification_logs(certificate_id);
CREATE INDEX idx_verification_logs_verified_at ON certificate_verification_logs(verified_at DESC);
CREATE INDEX idx_verification_logs_status ON certificate_verification_logs(status);

-- 3. Certificate Templates Table
CREATE TABLE IF NOT EXISTS certificate_templates (
  id SERIAL PRIMARY KEY,
  
  -- Template Details
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Design & Layout
  template_html TEXT,
  template_css TEXT,
  background_image TEXT,
  
  -- Default Values
  default_issuer VARCHAR(255),
  default_issuer_title VARCHAR(255),
  default_signature TEXT,
  
  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for template lookups
CREATE INDEX idx_templates_type ON certificate_templates(type);
CREATE INDEX idx_templates_active ON certificate_templates(is_active);

-- 4. Certificate Batches Table
CREATE TABLE IF NOT EXISTS certificate_batches (
  id SERIAL PRIMARY KEY,
  
  -- Batch Details
  batch_name VARCHAR(255) NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  certificate_type VARCHAR(100) NOT NULL,
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  
  -- Processing
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_log TEXT,
  
  -- Metadata
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for batch tracking
CREATE INDEX idx_batches_status ON certificate_batches(status);
CREATE INDEX idx_batches_created_at ON certificate_batches(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE certificates IS 'Stores all issued certificates with verification IDs and QR codes';
COMMENT ON TABLE certificate_verification_logs IS 'Audit trail of all certificate verification attempts';
COMMENT ON TABLE certificate_templates IS 'Reusable certificate templates for different programs';
COMMENT ON TABLE certificate_batches IS 'Tracks bulk certificate generation operations';

COMMENT ON COLUMN certificates.verification_id IS 'Unique 64-character cryptographically secure ID for verification';
COMMENT ON COLUMN certificates.status IS 'Certificate status: active, revoked, or expired';
COMMENT ON COLUMN certificates.qr_code_url IS 'URL to the generated QR code image';
COMMENT ON COLUMN certificates.public_verification_url IS 'Public URL for certificate verification';
