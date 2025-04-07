import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';
import mjml2html from 'mjml';
const Handlebars = require('handlebars');

const TEMPLATE_DIR = path.join(process.cwd(), 'templates');
const EMAIL_DIR = path.join(TEMPLATE_DIR, 'emails');
const LAYOUT_DIR = path.join(EMAIL_DIR, 'layouts');

const resend = new Resend(process.env.RESEND_API_KEY);

// Cache for compiled templates
const templateCache: Record<string, (data: any) => string> = {};

/**
 * Load and compile an MJML template
 */
async function loadMjmlTemplate(
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

export const sendVerificationEmail = async (
  email: string,
  token: string,
  name?: string,
) => {
  const verifyEmailLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  try {
    const template = await loadMjmlTemplate('verification');

    const data = {
      title: `Email Verification - ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      }`,
      name: name || email.split('@')[0],
      verificationLink: verifyEmailLink,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher',
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      privacyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
      termsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
      currentYear: new Date().getFullYear(),
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
      title: `Reset Your Password - ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      }`,
      name: email.split('@')[0],
      resetPasswordLink: resetPasswordLink,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher',
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      privacyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
      termsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
      currentYear: new Date().getFullYear(),
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `[${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
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
      title: `Two-Factor Authentication - ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      }`,
      name: email.split('@')[0],
      token: token,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher',
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      privacyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
      termsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
      currentYear: new Date().getFullYear(),
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `[${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
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
      title: `Welcome to ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      } Pro!`,
      name: name || 'there',
      trialEndDate: trialEndDate.toLocaleDateString(),
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      currentYear: new Date().getFullYear(),
      productName: 'Resume Matcher Pro',
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher',
      privacyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
      termsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `Welcome to ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      } Pro!`,
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
      title: `Your Trial is Ending Soon - ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      } Pro`,
      name: name || 'there',
      trialEndDate: trialEndDate.toLocaleDateString(),
      firstBillingAmount: amount.toFixed(2),
      currency: currency.toUpperCase(),
      manageBillingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher',
      currentYear: new Date().getFullYear(),
      privacyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
      termsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `Your ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      } Pro Trial is Ending Soon`,
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
      title: `Payment Failed - ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      } Pro`,
      name: name || 'there',
      amount: amount.toFixed(2),
      currency: currency.toUpperCase(),
      paymentLink: paymentLink,
      attemptCount: attemptCount,
      nextAttemptDate: nextAttemptDate
        ? nextAttemptDate.toLocaleDateString()
        : 'No automatic retry scheduled',
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher',
      currentYear: new Date().getFullYear(),
      privacyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
      termsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `Action Required: Payment Failed for ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      } Pro`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
    return { success: false, error };
  }
};

export const sendSubscriptionCanceledEmail = async (
  email: string,
  name: string,
  endDate: Date,
) => {
  try {
    const template = await loadMjmlTemplate('subscription-ended');
    const html = template({
      title: `Subscription Ended - ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      } Pro`,
      name: name || 'there',
      endDate: endDate.toLocaleDateString(),
      resubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      feedbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/feedback`,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher',
      currentYear: new Date().getFullYear(),
      privacyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
      termsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `Your ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      } Pro Subscription Has Ended`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send subscription canceled email:', error);
    return { success: false, error };
  }
};

export const sendWinBackEmail = async (
  email: string,
  name: string,
  userId: string,
) => {
  try {
    const template = await loadMjmlTemplate('win-back');
    const html = template({
      title: `Special Offer - ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      } Pro`,
      name: name || 'there',
      specialOfferUrl: `${process.env.NEXT_PUBLIC_APP_URL}/special-offer?userId=${userId}`,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      appName: process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher',
      currentYear: new Date().getFullYear(),
      emailEncoded: encodeURIComponent(email),
      privacyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
      termsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: `We Miss You at ${
        process.env.NEXT_PUBLIC_APP_NAME || 'Resume Matcher'
      } Pro`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send win back email:', error);
    return { success: false, error };
  }
};
