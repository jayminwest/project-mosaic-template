import * as React from 'react';
import { 
  Html, 
  Body, 
  Head, 
  Heading, 
  Hr, 
  Container, 
  Preview, 
  Section, 
  Text, 
  Button 
} from '@react-email/components';

interface VerificationEmailProps {
  verificationLink: string;
  productName?: string;
}

export const VerificationEmail = ({
  verificationLink,
  productName = 'Our Product',
}: VerificationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email for {productName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify Your Email</Heading>
          <Text style={text}>
            Thanks for signing up for {productName}! Please verify your email address to get started.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={verificationLink}>
              Verify Email
            </Button>
          </Section>
          <Text style={text}>
            Or copy and paste this URL into your browser:
          </Text>
          <Text style={linkText}>
            {verificationLink}
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn't sign up for {productName}, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px',
  borderRadius: '4px',
  maxWidth: '520px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0',
  padding: '0',
  lineHeight: '1.5',
};

const text = {
  color: '#333',
  fontSize: '16px',
  margin: '20px 0',
  lineHeight: '1.5',
};

const linkText = {
  color: '#333',
  fontSize: '14px',
  margin: '20px 0',
  lineHeight: '1.5',
  wordBreak: 'break-all' as const,
};

const buttonContainer = {
  margin: '30px 0',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '1.5',
};

export default VerificationEmail;
