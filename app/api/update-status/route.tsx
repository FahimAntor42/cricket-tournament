import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import StatusUpdateEmail from '@/components/emails/UpdateStatusEmail';
import React from 'react';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamId, status, captainEmail, teamName } = body;

    if (!status || !captainEmail) {
      return NextResponse.json(
        { error: 'Missing required parameters (status, captainEmail)' },
        { status: 400 }
      );
    }

    // 1. Initialize Supabase safely
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (teamId) {
      const { error: dbError } = await supabase
        .from('teams')
        .update({ status })
        .eq('id', teamId);

      if (dbError) throw dbError;
    }

    // 2. Initialize Resend with fallback string for build safety
    const resendApiKey = process.env.RESEND_API_KEY || 're_dummy_build_key';
    const resend = new Resend(resendApiKey);
    const senderEmail = process.env.SENDER_EMAIL || 'Orient Blast <info@orientblast.dev.cv>';

    // 3. Create element via React.createElement (bypasses JSX type mismatches)
    const emailElement = React.createElement(StatusUpdateEmail, {
      teamName: teamName || 'Team',
      status: status,
    });

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: senderEmail,
      to: captainEmail,
      subject: `Orient Blast Registration: ${status.toUpperCase()}`,
      react: emailElement,
    });

    if (emailError) throw emailError;

    return NextResponse.json({ success: true, data: emailData });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}