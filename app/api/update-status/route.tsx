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

    // 1. Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (teamId) {
      const { error: dbError } = await supabase
        .from('registrations')
        .update({ status })
        .eq('id', teamId);

      if (dbError) throw dbError;
    }

    // 2. Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is missing in environment variables');
    }

    const resend = new Resend(resendApiKey);

    // Use verified production sender domain or environment variable fallback
    const senderEmail = process.env.SENDER_EMAIL || 'Orient Blast <noreply@orientblast.dev.cv>';

    // 3. Customize Subject for Rejected vs Confirmed
    const isRejected = String(status).toLowerCase() === 'rejected';
    const emailSubject = isRejected
      ? `Registration Update: Your Team ${teamName || ''} Registration Was Rejected`
      : `Registration Update: Your Team ${teamName || ''} Is ${String(status).toUpperCase()}`;

    // 4. Render React Email Template
    const emailElement = React.createElement(StatusUpdateEmail, {
      teamName: teamName || 'Team',
      status: status,
    });

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: senderEmail,
      to: captainEmail,
      subject: emailSubject,
      react: emailElement,
    });

    if (emailError) throw emailError;

    return NextResponse.json({ success: true, data: emailData });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}