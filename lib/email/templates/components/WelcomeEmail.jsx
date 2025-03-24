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

const WelcomeEmail = ({
  username = 'there',
  productName = 'Our Product',
  actionUrl = 'https://example.com/dashboard',
}) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {productName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to {productName}</Heading>
          <Text style={text}>Hello {username},</Text>
          <Text style={text}>
            Thank you for signing up for {productName}. We're excited to have you on board!
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={actionUrl}>
              Get Started
            </Button>
          </Section>
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

const buttonContainer = {
  margin: '30px 0',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center',
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

export default WelcomeEmail;
