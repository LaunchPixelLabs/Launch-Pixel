# 🎓 Certificate Verification System - Complete Documentation

## Overview

A comprehensive certificate management system with QR code verification, designed to issue, manage, and verify certificates for candidates. Built on top of your existing LaunchPixel AI Agent infrastructure without modifying any existing code.

---

## 🎯 Features

### Core Capabilities
- ✅ **Certificate Generation**: Create certificates with unique verification IDs
- ✅ **QR Code Generation**: Automatic QR code creation for each certificate
- ✅ **Public Verification**: Anyone can verify certificates via QR code or URL
- ✅ **Bulk Creation**: Generate multiple certificates at once
- ✅ **Manual Addition**: Add certificates one by one through UI or API
- ✅ **Revocation System**: Revoke certificates with reason tracking
- ✅ **Verification Logging**: Track every verification attempt with IP, location, timestamp
- ✅ **Expiry Management**: Set expiration dates for time-limited certificates
- ✅ **Analytics Dashboard**: View stats on certificates and verifications

### Security Features
- 🔒 Cryptographically secure 64-character verification IDs
- 🔒 Tamper-proof verification system
- 🔒 Audit trail for all certificate operations
- 🔒 IP and user agent tracking for verifications
- 🔒 Revocation with reason logging

---

## 📊 Database Schema

### New Tables Added

#### 1. `certificates`
Main table storing all certificate data.

```sql
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  verification_id VARCHAR(64) UNIQUE NOT NULL,
  
  -- Candidate Info
  candidate_id INTEGER REFERENCES agent_contacts(id),
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255),
  candidate_phone VARCHAR(50),
  
  -- Certificate Details
  certificate_type VARCHAR(100) NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  program_duration VARCHAR(100),
  issue_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP,
  
  -- Performance
  grade VARCHAR(50),
  skills_acquired TEXT,
  projects_completed TEXT,
  performance_notes TEXT,
  
  -- Issuer
  issued_by VARCHAR(255) NOT NULL DEFAULT 'Launch Pixel',
  issuer_title VARCHAR(255),
  issuer_signature TEXT,
  
  -- Status & Verification
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  verification_count INTEGER DEFAULT 0,
  last_verified_at TIMESTAMP,
  
  -- URLs
  qr_code_url TEXT,
  public_verification_url TEXT,
  
  -- Metadata
  metadata TEXT,
  notes TEXT,
  
  -- Audit
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP,
  revoked_by VARCHAR(255),
  revoked_reason TEXT
);
```

#### 2. `certificate_verification_logs`
Tracks every verification attempt.

```sql
CREATE TABLE certificate_verification_logs (
  id SERIAL PRIMARY KEY,
  certificate_id INTEGER REFERENCES certificates(id),
  verification_id VARCHAR(64) NOT NULL,
  verified_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  location VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  verified_by VARCHAR(255),
  purpose VARCHAR(100),
  notes TEXT
);
```

#### 3. `certificate_templates`
Store reusable certificate templates.

```sql
CREATE TABLE certificate_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  template_html TEXT,
  template_css TEXT,
  background_image TEXT,
  default_issuer VARCHAR(255),
  default_issuer_title VARCHAR(255),
  default_signature TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `certificate_batches`
Track bulk certificate generation.

```sql
CREATE TABLE certificate_batches (
  id SERIAL PRIMARY KEY,
  batch_name VARCHAR(255) NOT NULL,
  program_name VARCHAR(255) NOT NULL,
  certificate_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_log TEXT,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### Public Endpoints (No Auth Required)

#### 1. Verify Certificate
```http
GET /api/certificates/verify/:verificationId
```

**Response:**
```json
{
  "success": true,
  "certificate": {
    "id": 1,
    "candidateName": "John Doe",
    "programName": "AI Development Internship",
    "certificateType": "internship",
    "issueDate": "2026-01-15",
    "grade": "A+",
    "issuedBy": "Launch Pixel",
    "status": "active"
  },
  "status": "valid",
  "message": "Certificate is valid and authentic."
}
```

### Admin Endpoints (Require Authentication)

#### 2. Create Certificate
```http
POST /api/certificates/create
Headers: x-user-id: <user-id>
```

**Request Body:**
```json
{
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "candidatePhone": "+1234567890",
  "certificateType": "internship",
  "programName": "AI Development Internship",
  "programDuration": "3 months",
  "issueDate": "2026-01-15",
  "grade": "A+",
  "skillsAcquired": ["Python", "Machine Learning", "API Development"],
  "projectsCompleted": ["AI Chatbot", "Recommendation System"],
  "performanceNotes": "Excellent performance throughout the program",
  "issuedBy": "Launch Pixel",
  "issuerTitle": "CEO",
  "metadata": {
    "department": "Engineering",
    "supervisor": "Jane Smith"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate created successfully",
  "certificate": { ... },
  "verificationUrl": "https://launchpixel.in/verify/abc123...",
  "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=..."
}
```

#### 3. Bulk Create Certificates
```http
POST /api/certificates/bulk-create
Headers: x-user-id: <user-id>
```

**Request Body:**
```json
{
  "certificates": [
    {
      "candidateName": "John Doe",
      "certificateType": "internship",
      "programName": "AI Development",
      ...
    },
    {
      "candidateName": "Jane Smith",
      "certificateType": "course",
      "programName": "Web Development",
      ...
    }
  ]
}
```

#### 4. List Certificates
```http
GET /api/certificates/list?page=1&limit=50&status=active&search=john
Headers: x-user-id: <user-id>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 50)
- `status`: Filter by status (active, revoked, expired)
- `search`: Search by candidate name
- `type`: Filter by certificate type

#### 5. Get Certificate Details
```http
GET /api/certificates/:id
Headers: x-user-id: <user-id>
```

#### 6. Update Certificate
```http
PUT /api/certificates/:id
Headers: x-user-id: <user-id>
```

#### 7. Revoke Certificate
```http
POST /api/certificates/:id/revoke
Headers: x-user-id: <user-id>
```

**Request Body:**
```json
{
  "reason": "Candidate violated terms of service"
}
```

#### 8. Get Verification Logs
```http
GET /api/certificates/:id/verification-logs
Headers: x-user-id: <user-id>
```

#### 9. Get Statistics
```http
GET /api/certificates/stats/overview
Headers: x-user-id: <user-id>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "active": 140,
    "revoked": 5,
    "expired": 5,
    "totalVerifications": 1250,
    "byType": {
      "internship": 80,
      "course": 50,
      "achievement": 20
    }
  }
}
```

---

## 🚀 Usage Guide

### Method 1: Manual Creation via API

```bash
# Create a single certificate
curl -X POST https://your-worker.workers.dev/api/certificates/create \
  -H "Content-Type: application/json" \
  -H "x-user-id: your-user-id" \
  -d '{
    "candidateName": "John Doe",
    "candidateEmail": "john@example.com",
    "certificateType": "internship",
    "programName": "AI Development Internship",
    "issueDate": "2026-01-15",
    "grade": "A+"
  }'
```

### Method 2: Bulk Creation via CSV

1. Prepare a CSV file with candidate data:
```csv
candidateName,candidateEmail,certificateType,programName,grade
John Doe,john@example.com,internship,AI Development,A+
Jane Smith,jane@example.com,course,Web Development,A
```

2. Use the bulk create endpoint:
```bash
curl -X POST https://your-worker.workers.dev/api/certificates/bulk-create \
  -H "Content-Type: application/json" \
  -H "x-user-id: your-user-id" \
  -d @certificates.json
```

### Method 3: UI Dashboard (Coming Soon)

The `CertificateManagementUI` component provides a visual interface for:
- Creating certificates with a form
- Viewing all certificates in a table
- Searching and filtering
- Viewing QR codes
- Revoking certificates
- Viewing verification logs

---

## 🔐 QR Code System

### How It Works

1. **Generation**: When a certificate is created, a unique 64-character verification ID is generated using cryptographically secure random values.

2. **QR Code Creation**: A QR code is automatically generated pointing to:
   ```
   https://launchpixel.in/verify/{verificationId}
   ```

3. **QR Code API**: We use the free QR Server API:
   ```
   https://api.qrserver.com/v1/create-qr-code/?size=400x400&data={url}
   ```

4. **Verification Flow**:
   - User scans QR code
   - Redirects to verification page
   - System looks up certificate by verification ID
   - Checks status (active, revoked, expired)
   - Logs verification attempt
   - Returns certificate details

### QR Code Customization

You can customize QR codes by:
- Changing size: `?size=600x600`
- Adding logo: `?logo=https://your-logo.png`
- Changing format: `?format=svg`

For production, consider:
- Storing QR codes in Cloudflare R2
- Using a custom QR code generator
- Adding your brand logo to QR codes

---

## 📱 Frontend Integration

### Add to Dashboard

1. Import the component in your dashboard page:

```typescript
// frontend/app/call/dashboard/page.tsx
import CertificateManagementUI from "../../../components/dashboard/CertificateManagementUI"

// Add to your tab system:
{activeTab === "certificates" && <CertificateManagementUI />}
```

2. Add to navigation:

```typescript
const tabs = [
  // ... existing tabs
  { id: "certificates", label: "Certificates", icon: Award },
]
```

### Public Verification Page

Create a public verification page:

```typescript
// frontend/app/verify/[id]/page.tsx
export default async function VerifyPage({ params }: { params: { id: string } }) {
  const response = await fetch(`${API_BASE}/api/certificates/verify/${params.id}`)
  const data = await response.json()
  
  return (
    <div>
      {data.status === 'valid' ? (
        <div>✅ Valid Certificate</div>
      ) : (
        <div>❌ Invalid Certificate</div>
      )}
    </div>
  )
}
```

---

## 🎨 Customization

### Certificate Types

Default types:
- `internship`: For internship completion
- `course`: For course completion
- `achievement`: For special achievements
- `participation`: For event participation

Add custom types by simply using them in the API.

### Issuer Information

Customize issuer details:
```json
{
  "issuedBy": "Launch Pixel",
  "issuerTitle": "CEO & Founder",
  "issuerSignature": "data:image/png;base64,..." // Base64 encoded signature
}
```

### Metadata

Store custom data:
```json
{
  "metadata": {
    "department": "Engineering",
    "supervisor": "Jane Smith",
    "projectScore": 95,
    "attendanceRate": "98%"
  }
}
```

---

## 🔧 Database Migration

Run this to create the tables:

```bash
cd backend-worker
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

Or manually run the SQL from the schema section above.

---

## 📊 Analytics & Reporting

### Available Metrics

- Total certificates issued
- Active vs revoked vs expired
- Verification count per certificate
- Verification attempts over time
- Most verified certificates
- Certificates by type
- Certificates by program

### Export Options

- CSV export of all certificates
- PDF generation (coming soon)
- Verification logs export

---

## 🛡️ Security Best Practices

1. **Verification ID**: 64-character cryptographically secure random string
2. **Rate Limiting**: Implement rate limiting on verification endpoint
3. **IP Tracking**: Log IP addresses for fraud detection
4. **Revocation**: Immediate revocation with reason tracking
5. **Audit Trail**: Complete history of all operations

---

## 🚀 Deployment

### Environment Variables

Add to `wrangler.toml`:
```toml
[vars]
PUBLIC_URL = "https://launchpixel.in"
```

### Deploy

```bash
cd backend-worker
wrangler deploy
```

The certificate system will be available at:
- Admin API: `https://your-worker.workers.dev/api/certificates/*`
- Public Verification: `https://your-worker.workers.dev/api/certificates/verify/:id`

---

## 📝 Example Use Cases

### 1. Internship Completion

```json
{
  "candidateName": "John Doe",
  "candidateEmail": "john@example.com",
  "certificateType": "internship",
  "programName": "AI Development Internship",
  "programDuration": "3 months",
  "issueDate": "2026-04-25",
  "grade": "A+",
  "skillsAcquired": ["Python", "Machine Learning", "FastAPI"],
  "projectsCompleted": ["AI Chatbot", "Recommendation Engine"],
  "performanceNotes": "Outstanding performance. Completed all projects ahead of schedule."
}
```

### 2. Course Completion

```json
{
  "candidateName": "Jane Smith",
  "certificateType": "course",
  "programName": "Full Stack Web Development",
  "programDuration": "6 weeks",
  "issueDate": "2026-04-25",
  "grade": "95%",
  "skillsAcquired": ["React", "Node.js", "PostgreSQL"]
}
```

### 3. Achievement Award

```json
{
  "candidateName": "Alice Johnson",
  "certificateType": "achievement",
  "programName": "Best Project Award - Q1 2026",
  "issueDate": "2026-04-25",
  "performanceNotes": "Awarded for exceptional innovation in AI agent development"
}
```

---

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Certificate generation
- ✅ QR code creation
- ✅ Public verification
- ✅ Revocation system
- ✅ Verification logging

### Phase 2 (Next)
- [ ] PDF certificate generation
- [ ] Email delivery system
- [ ] Certificate templates
- [ ] Batch processing UI
- [ ] Advanced analytics

### Phase 3 (Future)
- [ ] Blockchain verification
- [ ] NFT certificates
- [ ] Mobile app for verification
- [ ] API webhooks
- [ ] Third-party integrations

---

## 🆘 Troubleshooting

### Issue: QR Code not generating
**Solution**: Check that the PUBLIC_URL environment variable is set correctly.

### Issue: Verification fails
**Solution**: Ensure the verification ID is exactly 64 characters and matches the database.

### Issue: Database connection error
**Solution**: Verify DATABASE_URL is set in wrangler.toml or .dev.vars.

---

## 📞 Support

For questions or issues:
- Email: contact@launchpixel.in
- GitHub: Create an issue
- WhatsApp: +91-7004635011

---

**Document Version**: 1.0  
**Last Updated**: April 26, 2026  
**Author**: LaunchPixel Engineering Team
