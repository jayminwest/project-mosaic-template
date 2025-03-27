import * as React from 'react';
import { 
  Html, Head, Body, Container, Section, 
  Text, Button, Heading, Link 
} from '@react-email/components';

interface CancellationEmailProps {
  username?: string;
  productName?: string;
  endDate?: string;
  reactivateUrl?: string;
}

export default function CancellationEmail({ 
  username = 'there',
  productName = 'Our Product',
  endDate = 'the end of your current billing period',
  reactivateUrl = 'https://example.com/reactivate'
}: CancellationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', margin: '0', padding: '0', backgroundColor: '#f6f9fc' }}>
        <Container style={{ padding: '40px 20px', margin: '0 auto', backgroundColor: '#ffffff', maxWidth: '600px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)' }}>
          <Heading style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px' }}>
            Subscription Canceled
          </Heading>
          
          <Text style={{ fontSize: '16px', lineHeight: '1.5', color: '#333', margin: '0 0 20px' }}>
            Hello {username},
          </Text>
          
          <Text style={{ fontSize: '16px', lineHeight: '1.5', color: '#333', margin: '0 0 20px' }}>
            We're sorry to see you go. Your {productName} subscription has been canceled as requested.
          </Text>
          
          <Text style={{ fontSize: '16px', lineHeight: '1.5', color: '#333', margin: '0 0 20px' }}>
            You'll continue to have access to all premium features until {endDate}.
          </Text>
          
          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Button
              href={reactivateUrl}
              style={{
                backgroundColor: '#4f46e5',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '5px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'inline-block',
              }}
            >
              Reactivate My Subscription
            </Button>
          </Section>
          
          <Text style={{ fontSize: '16px', lineHeight: '1.5', color: '#333', margin: '0 0 20px' }}>
            If you've changed your mind or canceled by mistake, you can reactivate your subscription anytime before {endDate} to avoid any interruption in service.
          </Text>
          
          <Text style={{ fontSize: '16px', lineHeight: '1.5', color: '#333', margin: '0 0 20px' }}>
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </Text>
          
          <Text style={{ fontSize: '16px', lineHeight: '1.5', color: '#333', margin: '0 0 20px' }}>
            Thank you for being a {productName} customer.
          </Text>
          
          <Text style={{ fontSize: '16px', lineHeight: '1.5', color: '#333', margin: '0 0 20px' }}>
            Best regards,<br />
            The {productName} Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
