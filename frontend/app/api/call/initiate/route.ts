import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

async function verifyAuth(request: Request): Promise<{ uid: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split('Bearer ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}

interface InitiateCallRequest {
  phone: string;
  agentId: string;
  name?: string;
  customContext?: Record<string, any>;
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    const { phone, agentId, name, customContext } = await request.json() as InitiateCallRequest;
    
    if (!phone || !agentId) {
      return NextResponse.json(
        { error: 'Phone and agentId are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (E.164)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use E.164 format: +1234567890' },
        { status: 400 }
      );
    }

    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    
    if (!workerUrl) {
      console.error('[Initiate API] Missing NEXT_PUBLIC_WORKER_URL');
      return NextResponse.json(
        { error: 'Server configuration error: Worker URL not configured' },
        { status: 500 }
      );
    }

    console.log(`[Initiate API] Initiating call to ${phone} using agent ${agentId} for ${name || 'Unknown'}`);

    // Call the Cloudflare Worker to initiate the call
    const response = await fetch(`${workerUrl}/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toPhone: phone,
        contactName: name,
        customContext,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Initiate API] Worker Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to initiate call', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Initiate API] Call initiated successfully:', data.callSid);

    return NextResponse.json({
      success: true,
      callId: data.callSid,
      message: 'Call initiated successfully',
      status: data.status,
      data,
    });

  } catch (error: any) {
    console.error('[Initiate API] Failed to initiate call:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call', details: error.message },
      { status: 500 }
    );
  }
}
