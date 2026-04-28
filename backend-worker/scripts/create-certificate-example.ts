/**
 * Example script to create certificates
 * 
 * Usage:
 * 1. Set your environment variables
 * 2. Run: npx tsx scripts/create-certificate-example.ts
 */

const API_BASE = process.env.WORKER_URL || 'http://localhost:8787';
const USER_ID = process.env.USER_ID || 'admin-user';

// Example 1: Create a single certificate
async function createSingleCertificate() {
  const response = await fetch(`${API_BASE}/api/certificates/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
    },
    body: JSON.stringify({
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@example.com',
      candidatePhone: '+1234567890',
      certificateType: 'internship',
      programName: 'AI Development Internship',
      programDuration: '3 months',
      issueDate: new Date().toISOString(),
      grade: 'A+',
      skillsAcquired: ['Python', 'Machine Learning', 'FastAPI', 'PostgreSQL'],
      projectsCompleted: ['AI Chatbot', 'Recommendation System', 'Voice Agent'],
      performanceNotes: 'Outstanding performance throughout the internship. Demonstrated exceptional problem-solving skills and delivered all projects ahead of schedule.',
      issuedBy: 'Launch Pixel',
      issuerTitle: 'CEO & Founder',
      metadata: {
        department: 'Engineering',
        supervisor: 'Jane Smith',
        finalScore: 95,
      },
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Certificate created successfully!');
    console.log('📄 Certificate ID:', data.certificate.id);
    console.log('🔗 Verification URL:', data.verificationUrl);
    console.log('📱 QR Code URL:', data.qrCodeUrl);
    console.log('\n📋 Full Certificate Data:');
    console.log(JSON.stringify(data.certificate, null, 2));
  } else {
    console.error('❌ Failed to create certificate:', data.error);
  }
}

// Example 2: Create multiple certificates (bulk)
async function createBulkCertificates() {
  const candidates = [
    {
      candidateName: 'Alice Johnson',
      candidateEmail: 'alice@example.com',
      certificateType: 'course',
      programName: 'Full Stack Web Development',
      programDuration: '6 weeks',
      grade: 'A',
      skillsAcquired: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    },
    {
      candidateName: 'Bob Smith',
      candidateEmail: 'bob@example.com',
      certificateType: 'internship',
      programName: 'DevOps Engineering',
      programDuration: '2 months',
      grade: 'A+',
      skillsAcquired: ['Kubernetes', 'CI/CD', 'AWS', 'Terraform'],
    },
    {
      candidateName: 'Carol Williams',
      candidateEmail: 'carol@example.com',
      certificateType: 'achievement',
      programName: 'Best Project Award - Q1 2026',
      grade: 'Excellence',
      performanceNotes: 'Awarded for exceptional innovation in AI agent development',
    },
  ];

  const response = await fetch(`${API_BASE}/api/certificates/bulk-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': USER_ID,
    },
    body: JSON.stringify({
      certificates: candidates.map(c => ({
        ...c,
        issueDate: new Date().toISOString(),
        issuedBy: 'Launch Pixel',
      })),
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log(`✅ Created ${data.results.length} certificates!`);
    data.results.forEach((result: any, index: number) => {
      if (result.success) {
        console.log(`\n${index + 1}. ${result.candidateName}`);
        console.log(`   🔗 ${result.verificationUrl}`);
        console.log(`   📱 ${result.qrCodeUrl}`);
      } else {
        console.log(`\n${index + 1}. ${result.candidateName} - ❌ Failed: ${result.error}`);
      }
    });
  } else {
    console.error('❌ Bulk creation failed:', data.error);
  }
}

// Example 3: Verify a certificate
async function verifyCertificate(verificationId: string) {
  const response = await fetch(`${API_BASE}/api/certificates/verify/${verificationId}`);
  const data = await response.json();
  
  if (data.success && data.status === 'valid') {
    console.log('✅ Certificate is VALID!');
    console.log('📄 Candidate:', data.certificate.candidateName);
    console.log('🎓 Program:', data.certificate.programName);
    console.log('📅 Issued:', new Date(data.certificate.issueDate).toLocaleDateString());
    console.log('⭐ Grade:', data.certificate.grade || 'N/A');
  } else {
    console.log('❌ Certificate verification failed');
    console.log('Status:', data.status);
    console.log('Message:', data.message);
  }
}

// Example 4: List all certificates
async function listCertificates() {
  const response = await fetch(`${API_BASE}/api/certificates/list?limit=10`, {
    headers: {
      'x-user-id': USER_ID,
    },
  });

  const data = await response.json();
  
  if (data.success) {
    console.log(`📋 Found ${data.certificates.length} certificates:\n`);
    data.certificates.forEach((cert: any, index: number) => {
      console.log(`${index + 1}. ${cert.candidateName} - ${cert.programName}`);
      console.log(`   Status: ${cert.status} | Type: ${cert.certificateType}`);
      console.log(`   Verified: ${cert.verificationCount} times`);
      console.log(`   🔗 ${cert.publicVerificationUrl}\n`);
    });
  } else {
    console.error('❌ Failed to list certificates:', data.error);
  }
}

// Example 5: Get statistics
async function getStatistics() {
  const response = await fetch(`${API_BASE}/api/certificates/stats/overview`, {
    headers: {
      'x-user-id': USER_ID,
    },
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('📊 Certificate Statistics:\n');
    console.log(`Total Certificates: ${data.stats.total}`);
    console.log(`Active: ${data.stats.active}`);
    console.log(`Revoked: ${data.stats.revoked}`);
    console.log(`Expired: ${data.stats.expired}`);
    console.log(`Total Verifications: ${data.stats.totalVerifications}`);
    console.log('\nBy Type:');
    Object.entries(data.stats.byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  } else {
    console.error('❌ Failed to get statistics:', data.error);
  }
}

// Main execution
async function main() {
  console.log('🚀 Certificate System Examples\n');
  console.log('='.repeat(50));
  
  // Uncomment the examples you want to run:
  
  // await createSingleCertificate();
  // await createBulkCertificates();
  // await verifyCertificate('your-verification-id-here');
  // await listCertificates();
  // await getStatistics();
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ Done!');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  createSingleCertificate,
  createBulkCertificates,
  verifyCertificate,
  listCertificates,
  getStatistics,
};
