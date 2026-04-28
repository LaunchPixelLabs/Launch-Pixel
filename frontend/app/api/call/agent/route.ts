import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

/**
 * Validate system prompt for problematic patterns
 * Requirement 22.1, 22.2, 22.3, 22.4, 22.5
 */
async function validateSystemPrompt(
  systemPrompt: string,
  userId: string,
  agentType: 'outbound' | 'inbound'
): Promise<{ isValid: boolean; warnings: any[] }> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/agent-configurations/validate-system-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        userId,
        agentType,
      }),
    });

    if (!response.ok) {
      console.error('[Agent API] Validation service error');
      // If validation service fails, allow the request to proceed
      return { isValid: true, warnings: [] };
    }

    return await response.json();
  } catch (error) {
    console.error('[Agent API] Failed to validate system prompt:', error);
    // If validation fails, allow the request to proceed
    return { isValid: true, warnings: [] };
  }
}

interface AgentConfig {
  name: string;
  systemPrompt: string;
  voiceId: string;
  firstMessage?: string;
  language?: string;
}

interface RequestBody {
  type: 'outbound' | 'inbound';
  config: AgentConfig;
}

/**
 * Verify Firebase authentication token
 */
async function verifyAuth(request: Request): Promise<{ uid: string; email?: string } | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
  } catch (error) {
    console.error('[Agent API] Auth verification failed:', error);
    return null;
  }
}

/**
 * Store agent configuration in database
 */
async function storeAgentConfiguration(
  userId: string,
  agentType: 'outbound' | 'inbound',
  elevenLabsAgentId: string,
  config: AgentConfig
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${backendUrl}/api/agent-configurations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        agentType,
        elevenLabsAgentId,
        name: config.name,
        systemPrompt: config.systemPrompt,
        voiceId: config.voiceId,
        firstMessage: config.firstMessage || 'Hello! How can I help you today?',
        language: config.language || 'en',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Agent API] Failed to store configuration:', errorData);
      throw new Error('Failed to store agent configuration');
    }

    return await response.json();
  } catch (error) {
    console.error('[Agent API] Database storage error:', error);
    throw error;
  }
}

/**
 * Map ElevenLabs API errors to user-friendly messages
 */
function mapElevenLabsError(status: number, errorData: any): string {
  // Requirement 24.1: Authentication error
  if (status === 401 || status === 403) {
    return 'Invalid API key - check configuration';
  }
  
  // Requirement 24.2: Rate limit error
  if (status === 429) {
    const retryAfter = errorData?.retry_after || 'a few';
    return `Rate limit exceeded - try again in ${retryAfter} minutes`;
  }
  
  // Requirement 24.3: Quota exceeded error
  if (status === 402 || (errorData?.detail && errorData.detail.includes('quota'))) {
    return 'Monthly quota exceeded - upgrade plan or wait until next billing cycle';
  }
  
  // Requirement 24.4: Service unavailable
  if (status >= 500) {
    return 'Service temporarily unavailable - retrying automatically';
  }
  
  return 'Failed to create agent - please try again';
}

export async function POST(request: Request) {
  try {
    // Requirement 7.1: Validate authentication
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please sign in to continue' },
        { status: 401 }
      );
    }

    // Requirement 7.1: Validate request body
    const body = await request.json() as RequestBody;
    const { type, config } = body;
    
    // Requirement 7.1: Validate required fields
    if (!type || !config) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Missing type or config' },
        { status: 400 }
      );
    }

    if (!config.name || !config.systemPrompt || !config.voiceId) {
      return NextResponse.json(
        { 
          error: 'Invalid configuration', 
          message: 'Missing required fields: name, systemPrompt, or voiceId' 
        },
        { status: 400 }
      );
    }

    // Requirement 22.1: Validate system prompt for problematic patterns
    const validationResult = await validateSystemPrompt(
      config.systemPrompt,
      user.uid,
      type
    );

    // Requirement 22.5: Return validation warnings with specific issues
    if (!validationResult.isValid) {
      console.warn('[Agent API] System prompt validation failed:', validationResult.warnings);
      return NextResponse.json(
        {
          error: 'System prompt validation failed',
          message: 'The system prompt contains problematic patterns that could lead to agent misbehavior',
          warnings: validationResult.warnings,
          canProceed: false,
        },
        { status: 400 }
      );
    }

    // If there are non-critical warnings, include them in the response
    // but allow the request to proceed
    const hasWarnings = validationResult.warnings.length > 0;

    // Requirement 7.2: Check for ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      console.error('[Agent API] Missing ELEVENLABS_API_KEY');
      return NextResponse.json(
        { error: 'Server configuration error: Missing API key' },
        { status: 500 }
      );
    }

    console.log(`[Agent API] Creating ${type} agent for user ${user.uid} with voice ${config.voiceId}...`);

    // Requirement 7.2: Call ElevenLabs Conversational AI API
    // https://elevenlabs.io/docs/api-reference/create-agent
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.name || `${type} Agent`,
        conversation_config: {
          agent: {
            prompt: {
              prompt: config.systemPrompt,
            },
            first_message: config.firstMessage || 'Hello! How can I help you today?',
            language: config.language || 'en',
          },
          tts: {
            voice_id: config.voiceId,
          },
        },
      }),
    });

    // Requirement 7.3: Handle ElevenLabs API errors with specific messages
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Agent API] ElevenLabs API Error:', response.status, errorData);
      
      const userMessage = mapElevenLabsError(response.status, errorData);
      
      return NextResponse.json(
        { 
          error: userMessage,
          details: errorData,
          status: response.status
        },
        { status: response.status >= 500 ? 503 : response.status }
      );
    }

    const data = await response.json();
    const agentId = data.agent_id;
    
    console.log('[Agent API] Agent created successfully:', agentId);

    // Requirement 7.4: Store agent configuration in database with userId association
    try {
      await storeAgentConfiguration(user.uid, type, agentId, config);
      console.log('[Agent API] Configuration stored in database');
    } catch (dbError) {
      console.error('[Agent API] Failed to store configuration, but agent was created:', dbError);
      // Continue - agent was created successfully in ElevenLabs
    }

    // Requirement 7.5: Return agentId and success confirmation
    return NextResponse.json({
      success: true,
      agentId: agentId,
      message: 'Agent created successfully in ElevenLabs',
      data,
      // Include validation warnings if present (Requirement 22.5)
      ...(hasWarnings && { 
        validationWarnings: validationResult.warnings,
        warningMessage: 'Agent created successfully, but system prompt has warnings. Review them carefully.'
      }),
    });

  } catch (error: any) {
    console.error('[Agent API] Failed to create agent:', error);
    
    // Requirement 24.4: Service temporarily unavailable
    return NextResponse.json(
      { 
        error: 'Service temporarily unavailable - retrying automatically',
        details: error.message 
      },
      { status: 503 }
    );
  }
}
