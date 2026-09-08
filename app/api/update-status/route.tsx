import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import StatusUpdateEmail from '@/components/emails/UpdateStatusEmail';
import React from 'react';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { teamId, status, captainEmail, teamName, institutionType } = body;

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
      return NextResponse.json(
        { error: 'Supabase environment variables are missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Update status in Supabase DB first
    if (teamId) {
      const { error: dbError } = await supabase
        .from('registrations')
        .update({ status: String(status).toLowerCase() })
        .eq('id', teamId);

      if (dbError) {
        console.error('Supabase DB Update Error:', dbError);
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }
    }

    // 3. Dispatch Email asynchronously (Non-blocking execution)
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const senderEmail = process.env.SENDER_EMAIL || 'Orient Blast <noreply@orientblast.dev.cv>';
      const normalizedStatus = String(status).toLowerCase().trim();
      const isRejected = normalizedStatus === 'rejected';

      const emailSubject = isRejected
        ? `Registration Update: Your Team ${teamName || ''} Registration Was Rejected`
        : `🎉 Registration Confirmed: Team ${teamName || ''} is Approved!`;

      const emailElement = React.createElement(StatusUpdateEmail, {
        teamName: teamName || 'Team',
        status: normalizedStatus,
        institutionType: institutionType || '',
      });

      // Fire and forget (allows API response to return instantly to UI)
      resend.emails.send({
        from: senderEmail,
        to: captainEmail,
        subject: emailSubject,
        react: emailElement,
      }).then(({ data, error }) => {
        if (error) {
          console.error('Background Resend Error:', error);
        } else {
          console.log('Background Email Sent successfully:', data?.id);
        }
      }).catch((err) => {
        console.error('Background Email Execution Failure:', err);
      });
    }

    // Respond to frontend immediately without waiting for SMTP handshakes
    return NextResponse.json({ success: true, message: 'Status updated successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}