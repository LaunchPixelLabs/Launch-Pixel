import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    contacts: [
      { id: 1, name: "Elon Musk", phone: "+1 (555) 012-3456", status: "Pending Call" },
      { id: 2, name: "Sam Altman", phone: "+1 (555) 987-6543", status: "Called (Booked)" }
    ]
  });
}

export async function POST(request: Request) {
  try {
    const { name, phone } = await request.json();
    
    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    // In production, save to MySQL database
    console.log(`[API] Added new contact: ${name} (${phone})`);
    
    return NextResponse.json({
      success: true,
      message: 'Contact added successfully'
    });
  } catch (error) {
    console.error('Failed to add contact:', error);
    return NextResponse.json({ error: 'Failed to add contact' }, { status: 500 });
  }
}
