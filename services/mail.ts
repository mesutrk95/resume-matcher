import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';
import mjml2html from 'mjml';
import * as Handlebars from 'handlebars';
import { EMAIL_CONSTANTS } from '../lib/constants';

const TEMPLATE_DIR = path.join(process.cwd(), 'templates');
const EMAIL_DIR = path.join(TEMPLATE_DIR, 'emails');
const LAYOUT_DIR = path.join(EMAIL_DIR, 'layouts');

const resend = new Resend(process.env.RESEND_API_KEY);

// Cache for compiled templates
const templateCache: Record<string, (data: any) => string> = {};

/**
 * Get base email data that should be included in all emails
 */
export function getBaseEmailData() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Minova AI';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://minova.ai';

  return {
    // Basic app info
    appName,
    appUrl,
    title: appName,
    previewText: `Message from ${appName}`,

    // URLs for navigation
    websiteUrl: appUrl,
    blogUrl: `${appUrl}/blog`,
    contactUrl: `${appUrl}/contact`,

    // Social media links
    facebookUrl: EMAIL_CONSTANTS.FACEBOOK_URL,
    twitterUrl: EMAIL_CONSTANTS.TWITTER_URL,
    linkedinUrl: EMAIL_CONSTANTS.LINKEDIN_URL,
    instagramUrl: EMAIL_CONSTANTS.INSTAGRAM_URL,

    // Contact information
    companyAddress: EMAIL_CONSTANTS.COMPANY_ADDRESS,
    contactEmail: process.env.EMAIL_FROM?.split('<')[1]?.split('>')[0] || 'contact@minova.ai',

    // Footer links
    privacyUrl: process.env.PRIVACY_POLICY_URL || `${appUrl}/privacy-policy`,
    termsUrl: process.env.TERMS_OF_SERVICE_URL || `${appUrl}/terms-of-service`,
    unsubscribeUrl: `${appUrl}/unsubscribe`,

    // Current year for copyright
    currentYear: new Date().getFullYear(),
  };
}

/**
 * Load and compile an MJML template
 */
export async function loadMjmlTemplate(
  templateName: string,
  layoutName = 'default',
): Promise<(data: any) => string> {
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }

  try {
    // Load the template
    const layoutPath = path.join(LAYOUT_DIR, `${layoutName}.mjml`);
    const layoutTemplate = await fs.readFile(layoutPath, 'utf8');

    const templatePath = path.join(EMAIL_DIR, `${templateName}.mjml`);
    const mjmlContent = await fs.readFile(templatePath, 'utf-8');

    Handlebars.registerPartial('content', mjmlContent);

    const template = Handlebars.compile(layoutTemplate);

    const templateFn = (data: any) => {
      const mjmlContent = template(data);

      const { html } = mjml2html(mjmlContent);
      return html;
    };

    templateCache[templateName] = templateFn;
    return templateCache[templateName];
  } catch (error) {
    console.error(`Failed to load email template ${templateName}:`, error);
    throw new Error(`Failed to load email template: ${templateName}`);
  }
}

export const sendVerificationEmail = async (email: string, token: string, name?: string) => {
  const verifyEmailLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  try {
    const template = await loadMjmlTemplate('verification');

    const data = {
      ...getBaseEmailData(),
      title: `Email Verification - ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'}`,
      previewText: 'Please verify your email address to complete your registration',
      name: name || email.split('@')[0],
      verificationLink: verifyEmailLink,
    };

    const html = template(data);

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: 'Verify your email address',
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetPasswordLink = `${process.env.NEXT_PUBLIC_APP_URL}/new-password?token=${token}`;

  try {
    const template = await loadMjmlTemplate('reset-password');
    const html = template({
      ...getBaseEmailData(),
      title: `Reset Your Password - ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'}`,
      previewText: 'Instructions to reset your password',
      name: email.split('@')[0],
      resetPasswordLink: resetPasswordLink,
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `[${
        process.env.NEXT_PUBLIC_APP_NAME || 'Minova'
      }] Action required: Reset your password`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send reset password email:', error);
    return { success: false, error };
  }
};

export const sendTwoFactorEmail = async (email: string, token: string) => {
  try {
    const template = await loadMjmlTemplate('two-factor');
    const html = template({
      ...getBaseEmailData(),
      title: `Two-Factor Authentication - ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'}`,
      previewText: 'Your two-factor authentication code',
      name: email.split('@')[0],
      token: token,
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `[${
        process.env.NEXT_PUBLIC_APP_NAME || 'Minova'
      }] Action required: Confirm Two-Factor Authentication`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send two-factor email:', error);
    return { success: false, error };
  }
};

export const sendSubscriptionWelcomeEmail = async (
  email: string,
  name: string,
  trialEndDate: Date,
) => {
  try {
    const template = await loadMjmlTemplate('subscription-welcome');
    const html = template({
      ...getBaseEmailData(),
      title: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro!`,
      previewText: `Welcome to your ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro subscription`,
      name: name || 'there',
      trialEndDate: trialEndDate.toLocaleDateString(),
      productName: 'Minova Pro',
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro!`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send subscription welcome email:', error);
    return { success: false, error };
  }
};

export const sendTrialEndingEmail = async (
  email: string,
  name: string,
  trialEndDate: Date,
  amount: number,
  currency: string,
) => {
  try {
    const template = await loadMjmlTemplate('trial-ending');
    const html = template({
      ...getBaseEmailData(),
      title: `Your Trial is Ending Soon - ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro`,
      previewText: `Your ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro trial is ending soon`,
      name: name || 'there',
      trialEndDate: trialEndDate.toLocaleDateString(),
      firstBillingAmount: amount.toFixed(2),
      currency: currency.toUpperCase(),
      manageBillingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `Your ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro Trial is Ending Soon`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send trial ending email:', error);
    return { success: false, error };
  }
};

export const sendPaymentFailedEmail = async (
  email: string,
  name: string,
  amount: number,
  currency: string,
  paymentLink: string,
  attemptCount: number,
  nextAttemptDate?: Date,
) => {
  try {
    const template = await loadMjmlTemplate('payment-failed');
    const html = template({
      ...getBaseEmailData(),
      title: `Payment Failed - ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro`,
      previewText: `Action required: Your payment for ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro failed`,
      name: name || 'there',
      amount: amount.toFixed(2),
      currency: currency.toUpperCase(),
      paymentLink: paymentLink,
      attemptCount: attemptCount,
      nextAttemptDate: nextAttemptDate
        ? nextAttemptDate.toLocaleDateString()
        : 'No automatic retry scheduled',
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `Action Required: Payment Failed for ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Minova'
      } Pro`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
    return { success: false, error };
  }
};

export const sendSubscriptionCanceledEmail = async (email: string, name: string, endDate: Date) => {
  try {
    const template = await loadMjmlTemplate('subscription-ended');
    const html = template({
      ...getBaseEmailData(),
      title: `Subscription Ended - ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro`,
      previewText: `Your ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro subscription has ended`,
      name: name || 'there',
      endDate: endDate.toLocaleDateString(),
      resubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      feedbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/feedback`,
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `Your ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro Subscription Has Ended`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send subscription canceled email:', error);
    return { success: false, error };
  }
};

export const sendWinBackEmail = async (email: string, name: string, userId: string) => {
  try {
    const template = await loadMjmlTemplate('win-back');
    const html = template({
      ...getBaseEmailData(),
      title: `Special Offer - ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro`,
      previewText: `Special offer just for you - come back to ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro`,
      name: name || 'there',
      specialOfferUrl: `${process.env.NEXT_PUBLIC_APP_URL}/special-offer?userId=${userId}`,
      emailEncoded: encodeURIComponent(email),
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `We Miss You at ${process.env.NEXT_PUBLIC_APP_NAME || 'Minova'} Pro`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send win back email:', error);
    return { success: false, error };
  }
};
