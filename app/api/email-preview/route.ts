import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Import only the helper functions from mail service
// These helper functions should be exported in your mail.ts
import { getBaseEmailData, loadMjmlTemplate } from '@/services/mail';

// Only allow this API in development environment
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Get mock data for a template
 */
function getMockData(templateName: string) {
  // Get base email data that should be included in all emails
  const baseData = getBaseEmailData();

  switch (templateName) {
    case 'verification':
      return {
        ...baseData,
        title: `Email Verification - ${baseData.appName}`,
        previewText: 'Please verify your email address to complete your registration',
        name: 'Jane Doe',
        verificationLink: `${baseData.appUrl}/verify?token=mock-verification-token-12345`,
      };

    case 'reset-password':
      return {
        ...baseData,
        title: `Reset Your Password - ${baseData.appName}`,
        previewText: 'Instructions to reset your password',
        name: 'John Smith',
        resetPasswordLink: `${baseData.appUrl}/new-password?token=mock-reset-token-67890`,
      };

    case 'two-factor':
      return {
        ...baseData,
        title: `Two-Factor Authentication - ${baseData.appName}`,
        previewText: 'Your two-factor authentication code',
        name: 'Alex Johnson',
        token: '123456',
      };

    case 'subscription-welcome':
      return {
        ...baseData,
        title: `Welcome to ${baseData.appName} Pro!`,
        previewText: `Welcome to your ${baseData.appName} Pro subscription`,
        name: 'Taylor Wilson',
        trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        productName: 'Minova Pro',
      };

    case 'trial-ending':
      return {
        ...baseData,
        title: `Your Trial is Ending Soon - ${baseData.appName} Pro`,
        previewText: `Your ${baseData.appName} Pro trial is ending soon`,
        name: 'Jamie Lee',
        trialEndDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        firstBillingAmount: '12.99',
        currency: 'USD',
        manageBillingUrl: `${baseData.appUrl}/settings/billing`,
      };

    case 'payment-failed':
      return {
        ...baseData,
        title: `Payment Failed - ${baseData.appName} Pro`,
        previewText: `Action required: Your payment for ${baseData.appName} Pro failed`,
        name: 'Casey Morgan',
        amount: '12.99',
        currency: 'USD',
        attemptCount: 1,
        nextAttemptDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        paymentLink: `${baseData.appUrl}/settings/billing`,
      };

    case 'subscription-ended':
      return {
        ...baseData,
        title: `Subscription Ended - ${baseData.appName} Pro`,
        previewText: `Your ${baseData.appName} Pro subscription has ended`,
        name: 'Pat Johnson',
        endDate: new Date().toLocaleDateString(),
        resubscribeUrl: `${baseData.appUrl}/settings/billing`,
        feedbackUrl: `${baseData.appUrl}/feedback`,
      };

    case 'win-back':
      return {
        ...baseData,
        title: `Special Offer - ${baseData.appName} Pro`,
        previewText: `Special offer just for you - come back to ${baseData.appName} Pro`,
        name: 'Riley Cooper',
        specialOfferUrl: `${baseData.appUrl}/special-offer?userId=mock-user-123`,
        emailEncoded: encodeURIComponent('user@example.com'),
      };

    default:
      return {
        ...baseData,
        name: 'User',
        title: `Email from ${baseData.appName}`,
        previewText: 'This is a preview of your email',
      };
  }
}

/**
 * List all available email templates
 */
async function listTemplates() {
  try {
    const templatesDir = path.join(process.cwd(), 'templates/emails');
    const files = await fs.readdir(templatesDir);
    return files
      .filter(file => file.endsWith('.mjml') && !file.includes('/layouts/'))
      .map(file => file.replace('.mjml', ''));
  } catch (error) {
    console.error('Error listing templates:', error);
    return [];
  }
}

export async function GET(req: NextRequest) {
  // Only allow in development environment
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'This API is only available in development environment' },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const templateName = searchParams.get('template');
  const layoutName = searchParams.get('layout') || 'default';

  // List available templates if no template specified
  if (!templateName) {
    const templates = await listTemplates();
    return NextResponse.json({ templates });
  }

  try {
    // Get template function
    const templateFn = await loadMjmlTemplate(templateName, layoutName);

    // Get mock data for the template
    const mockData = getMockData(templateName);

    // Render the template with mock data
    const html = templateFn(mockData);

    // If raw parameter is present, return HTML directly
    if (searchParams.get('raw') === 'true') {
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // Otherwise return JSON with the rendered HTML and mock data
    return NextResponse.json({
      templateName,
      layoutName,
      mockData,
      html,
    });
  } catch (error) {
    console.error(`Error rendering template ${templateName}:`, error);
    return NextResponse.json(
      { error: `Failed to render template: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  // Only allow in development environment
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'This API is only available in development environment' },
      { status: 403 },
    );
  }

  try {
    // Get request body
    const { templateName, layoutName = 'default', data = {} } = await req.json();

    if (!templateName) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    // Get template function
    const templateFn = await loadMjmlTemplate(templateName, layoutName);

    // Get base mock data and merge with provided data
    const baseData = getBaseEmailData();
    const templateMockData = getMockData(templateName);
    const mergedData = { ...baseData, ...templateMockData, ...data };

    // Render the template with provided data
    const html = templateFn(mergedData);

    // Return JSON with the rendered HTML and data
    return NextResponse.json({
      templateName,
      layoutName,
      data: mergedData,
      html,
    });
  } catch (error) {
    console.error('Error in POST request:', error);
    return NextResponse.json(
      { error: `Failed to process request: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}

// GET http://localhost:8998/api/email-preview?template=verification&raw=true
// GET http://localhost:8998/api/email-preview?template=reset-password&raw=true
// GET http://localhost:8998/api/email-preview?template=two-factor&raw=true
// GET http://localhost:8998/api/email-preview?template=subscription-welcome&raw=true
// GET http://localhost:8998/api/email-preview?template=trial-ending&raw=true
// GET http://localhost:8998/api/email-preview?template=payment-failed&raw=true
// GET http://localhost:8998/api/email-preview?template=subscription-ended&raw=true
// GET http://localhost:8998/api/email-preview?template=win-back&raw=true
