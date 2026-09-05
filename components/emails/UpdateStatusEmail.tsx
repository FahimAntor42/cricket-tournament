import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

export interface StatusUpdateEmailProps {
  teamName: string;
  status: 'confirmed' | 'rejected';
}

export const StatusUpdateEmail: React.FC<StatusUpdateEmailProps> = ({
  teamName,
  status,
}) => {
  const isConfirmed = status === 'confirmed';

  return (
    <Html>
      <Head />
      <Preview>{isConfirmed ? 'Registration Confirmed!' : 'Registration Update'}</Preview>
      <Body style={{ backgroundColor: '#020617', fontFamily: 'sans-serif', padding: '24px 12px' }}>
        <Container style={{ backgroundColor: '#0f172a', borderRadius: '12px', padding: '32px', border: '1px solid #1e293b' }}>
          <Heading style={{ color: isConfirmed ? '#facc15' : '#ef4444', fontSize: '24px', marginTop: '0' }}>
            {isConfirmed ? '🎉 Registration Confirmed!' : '⚠️ Registration Issue'}
          </Heading>
          <Text style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.6' }}>
            {isConfirmed ? (
              <>
                Great news! Your team <strong style={{ color: '#ffffff' }}>{teamName}</strong> has been officially approved for <strong style={{ color: '#facc15' }}>The Orient Blast</strong> cricket tournament.
              </>
            ) : (
              <>
                We regret to inform you that your registration for team <strong style={{ color: '#ffffff' }}>{teamName}</strong> could not be verified (possibly due to an invalid Transaction ID or payment mismatch).
              </>
            )}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: '14px', marginTop: '24px' }}>
            {isConfirmed
              ? 'Get your squad ready and check back for schedule updates.'
              : 'Please contact tournament support for assistance.'}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default StatusUpdateEmail;