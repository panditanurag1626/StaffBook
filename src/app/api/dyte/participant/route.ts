import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { meetingId, name, picture, presetName, customParticipantId } = await request.json();

    if (!meetingId || !name) {
      return NextResponse.json({ error: 'Meeting ID and name are required' }, { status: 400 });
    }

    const orgId = process.env.DYTE_ORG_ID;
    const apiKey = process.env.DYTE_API_KEY;
    const authHeader = process.env.DYTE_AUTH_HEADER;

    const response = await fetch(`https://api.cluster.dyte.in/v2/meetings/${meetingId}/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        name,
        picture: picture || 'https://admin.staffbook.in/backend/uploads/user/default_image.jpeg',
        preset_name: presetName || 'group_call_participant',
        custom_participant_id: customParticipantId || `user_${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('Dyte API error:', data);
      return NextResponse.json({ error: data.message || 'Failed to add participant to Dyte meeting' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Dyte participant addition error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
