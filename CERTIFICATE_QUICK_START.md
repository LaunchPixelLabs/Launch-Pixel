# 🎓 Certificate System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup

Run the migration to create certificate tables:

```bash
cd backend-worker
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

### Step 2: Deploy Backend

```bash
cd backend-worker
wrangler deploy
```

Your certificate API will be available at:
```
https://your-worker.workers.dev/api/certificates/*
```

### Step 3: Create Your First Certificate

#### Option A: Using cURL

```bash
curl -X POST https://your-worker.workers.dev/api/certificates/create \
  -H "Content-Type: application/json" \
  -H "x-user-id: your-user-id" \
  -d '{
    "candidateName": "John Doe",
    "candidateEmail": "john@example.com",
    "certificateType": "internship",
    "programName": "AI Development Internship",
    "issueDate": "2026-04-25",
    "grade": "A+",
    "skillsAcquired": ["Python", "Machine Learning", "FastAPI"],
    "projectsCompleted": ["AI Chatbot", "Recommendation System"]
  }'
```

#### Option B: Using the Example Script

```bash
cd backend-worker
export WORKER_URL="https://your-worker.workers.dev"
export USER_ID="your-user-id"
npx tsx scripts/create-certificate-example.ts
```

### Step 4: Verify the Certificate

You'll receive a response like:

```json
{
  "success": true,
  "verificationUrl": "https://launchpixel.in/verify/abc123...",
  "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=..."
}
```

**Test verification:**
```bash
curl https://your-worker.workers.dev/api/certificates/verify/abc123...
```

---

## 📱 QR Code Generation

### Automatic QR Codes

Every certificate automatically gets a QR code that points to:
```
https://launchpixel.in/verify/{verificationId}
```

### Download QR Code

The `qrCodeUrl` in the response is a direct link to the QR code image:
```
https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://launchpixel.in/verify/abc123...
```

### Customize QR Code

Change the size:
```
?size=600x600  // Larger QR code
?size=200x200  // Smaller QR code
```

Change format:
```
?format=svg    // Vector format
?format=png    // PNG format (default)
```

---

## 🎯 Common Use Cases

### 1. Internship Certificates

```bash
curl -X POST $API_BASE/api/certificates/create \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -d '{
    "candidateName": "Alice Johnson",
    "candidateEmail": "alice@example.com",
    "certificateType": "internship",
    "programName": "Full Stack Development Internship",
    "programDuration": "3 months",
    "issueDate": "2026-04-25",
    "grade": "A+",
    "skillsAcquired": ["React", "Node.js", "PostgreSQL", "Docker"],
    "projectsCompleted": ["E-commerce Platform", "Real-time Chat App"],
    "performanceNotes": "Excellent performance. Completed all projects ahead of schedule."
  }'
```

### 2. Course Completion

```bash
curl -X POST $API_BASE/api/certificates/create \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -d '{
    "candidateName": "Bob Smith",
    "certificateType": "course",
    "programName": "Advanced Machine Learning",
    "programDuration": "6 weeks",
    "issueDate": "2026-04-25",
    "grade": "95%",
    "skillsAcquired": ["Deep Learning", "NLP", "Computer Vision"]
  }'
```

### 3. Achievement Awards

```bash
curl -X POST $API_BASE/api/certificates/create \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -d '{
    "candidateName": "Carol Williams",
    "certificateType": "achievement",
    "programName": "Best Project Award - Q1 2026",
    "issueDate": "2026-04-25",
    "performanceNotes": "Awarded for exceptional innovation in AI agent development"
  }'
```

### 4. Bulk Creation (Multiple Candidates)

```bash
curl -X POST $API_BASE/api/certificates/bulk-create \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin" \
  -d '{
    "certificates": [
      {
        "candidateName": "John Doe",
        "certificateType": "internship",
        "programName": "AI Development",
        "issueDate": "2026-04-25",
        "grade": "A+"
      },
      {
        "candidateName": "Jane Smith",
        "certificateType": "course",
        "programName": "Web Development",
        "issueDate": "2026-04-25",
        "grade": "A"
      }
    ]
  }'
```

---

## 🔍 Verification Flow

### For Certificate Holders

1. **Receive Certificate**: Get QR code via email or download
2. **Share QR Code**: Add to resume, LinkedIn, portfolio
3. **Anyone Can Verify**: Employers scan QR code to verify authenticity

### For Verifiers (Employers, HR)

1. **Scan QR Code**: Use any QR code scanner app
2. **View Certificate**: Redirects to verification page
3. **See Details**: View candidate name, program, grade, skills
4. **Check Status**: Confirms if certificate is valid, revoked, or expired

---

## 📊 View Statistics

```bash
curl https://your-worker.workers.dev/api/certificates/stats/overview \
  -H "x-user-id: admin"
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

## 🎨 Frontend Integration

### Add to Dashboard

1. **Import Component:**
```typescript
import CertificateManagementUI from "@/components/dashboard/CertificateManagementUI"
```

2. **Add to Tab System:**
```typescript
{activeTab === "certificates" && <CertificateManagementUI />}
```

3. **Add Navigation Item:**
```typescript
{ id: "certificates", label: "Certificates", icon: Award }
```

### Create Public Verification Page

```typescript
// app/verify/[id]/page.tsx
export default async function VerifyPage({ params }: { params: { id: string } }) {
  const response = await fetch(`${API_BASE}/api/certificates/verify/${params.id}`)
  const data = await response.json()
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      {data.status === 'valid' ? (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">✅ Valid Certificate</h1>
            <p className="text-gray-400">This certificate is authentic and verified</p>
          </div>
          
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">{data.certificate.candidateName}</h2>
            <p className="text-xl text-gray-300 mb-6">{data.certificate.programName}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <p className="text-white font-medium">{data.certificate.certificateType}</p>
              </div>
              <div>
                <span className="text-gray-500">Grade:</span>
                <p className="text-white font-medium">{data.certificate.grade || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Issued:</span>
                <p className="text-white font-medium">
                  {new Date(data.certificate.issueDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Issued By:</span>
                <p className="text-white font-medium">{data.certificate.issuedBy}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">❌ Invalid Certificate</h1>
          <p className="text-gray-400">{data.message}</p>
        </div>
      )}
    </div>
  )
}
```

---

## 🔐 Security Features

### Verification ID
- 64-character cryptographically secure random string
- Impossible to guess or brute force
- Unique for each certificate

### Audit Trail
- Every verification attempt is logged
- IP address and user agent tracked
- Timestamp recorded
- Purpose and verifier information captured

### Revocation
- Instant revocation with reason
- Revoked certificates show revocation date and reason
- Cannot be un-revoked (permanent record)

---

## 🛠️ Advanced Features

### Set Expiry Date

```json
{
  "candidateName": "John Doe",
  "certificateType": "course",
  "programName": "Security Certification",
  "issueDate": "2026-04-25",
  "expiryDate": "2027-04-25"  // Expires in 1 year
}
```

### Add Custom Metadata

```json
{
  "candidateName": "Jane Smith",
  "certificateType": "internship",
  "programName": "Data Science",
  "metadata": {
    "department": "Analytics",
    "supervisor": "Dr. John Doe",
    "finalScore": 95,
    "attendanceRate": "98%",
    "projectsCompleted": 5
  }
}
```

### Link to Existing Contact

```json
{
  "candidateId": 123,  // Links to agent_contacts table
  "candidateName": "Bob Johnson",
  "certificateType": "course",
  "programName": "Web Development"
}
```

---

## 📞 Support & Resources

- **Documentation**: See `CERTIFICATE_SYSTEM_DOCUMENTATION.md`
- **API Reference**: All endpoints documented in the main doc
- **Example Scripts**: Check `backend-worker/scripts/create-certificate-example.ts`
- **Support**: contact@launchpixel.in

---

## ✅ Checklist

- [ ] Database tables created
- [ ] Backend deployed
- [ ] First certificate created
- [ ] QR code generated
- [ ] Verification tested
- [ ] Frontend component added
- [ ] Public verification page created
- [ ] Bulk creation tested

---

**Ready to issue certificates? Start with Step 1!** 🚀
