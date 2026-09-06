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
        .from('registrations')
        .update({ status })
        .eq('id', teamId);

      if (dbError) throw dbError;
    }

    // 2. Initialize Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is missing');
    }

    const resend = new Resend(resendApiKey);

    // 3. Configure Sender & Recipient fallback
    // Use onboarding@resend.dev unless SENDER_EMAIL is explicitly set in Vercel
    const senderEmail = process.env.SENDER_EMAIL || 'Orient Blast <onboarding@resend.dev>';
    
    // If using test onboarding email, fallback to your Resend account email to prevent 403 blocks
    const targetRecipient = senderEmail.includes('onboarding@resend.dev')
      ? (process.env.ADMIN_TEST_EMAIL || captainEmail)
      : captainEmail;

    // 4. Render React email component
    const emailElement = React.createElement(StatusUpdateEmail, {
      teamName: teamName || 'Team',
      status: status,
    });

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: senderEmail,
      to: targetRecipient,
      subject: `Orient Blast Registration: ${String(status).toUpperCase()}`,
      react: emailElement,
    });

    if (emailError) {
      console.error('Resend API Error:', emailError);
      throw new Error(emailError.message);
    }

    return NextResponse.json({ success: true, data: emailData });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Update Status Route Failure:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}