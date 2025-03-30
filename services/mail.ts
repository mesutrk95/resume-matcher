import { Resend } from 'resend';
import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';

const resend = new Resend(process.env.RESEND_API_KEY);

const templateCache: Record<string, HandlebarsTemplateDelegate> = {};

async function loadTemplate(
  templateName: string,
): Promise<HandlebarsTemplateDelegate> {
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }

  try {
    const filePath = path.join(
      process.cwd(),
      'templates',
      'emails',
      `${templateName}.hbs`,
    );
    const templateContent = await fs.readFile(filePath, 'utf-8');
    const template = Handlebars.compile(templateContent);
    templateCache[templateName] = template;
    return template;
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
    const template = await loadTemplate('verification');

    const data = {
      name: name || email.split('@')[0],
      verificationLink: verifyEmailLink,
      appName: 'Resume Matcher',
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

  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: email,
    subject: '[Next Dashboard] Action required: Reset your password',
    html: `<p>Click <a href="${resetPasswordLink}">Here</a> to reset your password.</p>`,
  });
};

export const sendTwoFactorEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: email,
    subject:
      '[Next Dashboard] Action required: Confirm Two-Factor Authentication',
    html: `<p>${token} is your authentication Code.</p>`,
  });
};

// Subscription related emails

export const sendSubscriptionWelcomeEmail = async (
  email: string,
  name: string,
  trialEndDate: Date,
) => {
  try {
    const template = await loadTemplate('subscription-welcome');

    const data = {
      name: name || 'there',
      trialEndDate: trialEndDate.toLocaleDateString(),
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      currentYear: new Date().getFullYear(),
      productName: 'Resume Matcher Pro',
    };

    const html = template(data);

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: 'Welcome to Resume Matcher Pro!',
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
    const template = await loadTemplate('trial-ending');

    const data = {
      name: name || 'there',
      trialEndDate: trialEndDate.toLocaleDateString(),
      firstBillingAmount: amount.toFixed(2),
      currency: currency.toUpperCase(),
      manageBillingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      currentYear: new Date().getFullYear(),
    };

    const html = template(data);

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: 'Your Resume Matcher Pro Trial is Ending Soon',
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
    const template = await loadTemplate('payment-failed');

    const data = {
      name: name || 'there',
      amount: amount.toFixed(2),
      currency: currency.toUpperCase(),
      paymentLink: paymentLink,
      attemptCount: attemptCount,
      nextAttemptDate: nextAttemptDate
        ? nextAttemptDate.toLocaleDateString()
        : 'No automatic retry scheduled',
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      currentYear: new Date().getFullYear(),
    };

    const html = template(data);

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: 'Action Required: Payment Failed for Resume Matcher Pro',
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
    const template = await loadTemplate('subscription-ended');

    const data = {
      name: name || 'there',
      resubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      feedbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/feedback`,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      currentYear: new Date().getFullYear(),
    };

    const html = template(data);

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: 'Your Resume Matcher Pro Subscription Has Ended',
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
    const template = await loadTemplate('win-back');

    const data = {
      name: name || 'there',
      specialOfferUrl: `${process.env.NEXT_PUBLIC_APP_URL}/special-offer?userId=${userId}`,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      currentYear: new Date().getFullYear(),
      emailEncoded: encodeURIComponent(email),
    };

    const html = template(data);

    await resend.emails.send({
      from: process.env.EMAIL_FROM as string,
      to: email,
      subject: 'We Miss You at Resume Matcher Pro',
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send win back email:', error);
    return { success: false, error };
  }
};
