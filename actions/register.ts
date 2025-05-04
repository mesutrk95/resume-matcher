'use server';

import { registerSchema } from '@/schemas';
import { z } from 'zod';
import { createUser, getUserByEmail } from '@/services/user';
import { generateVerificationToken } from '@/services/verification-token';
import { sendVerificationEmail } from '@/services/mail';
import { hashPassword, response } from '@/lib/utils';
import { updateContactMarketingPreferences } from '@/lib/brevo';
import logger from '@/lib/logger';
import { signInCredentials } from './login';
import { getActivityDispatcher } from '@/lib/activity-dispatcher/factory';

export const register = async (payload: z.infer<typeof registerSchema>) => {
  // Check if user input is not valid.
  const validatedFields = registerSchema.safeParse(payload);
  if (!validatedFields.success) {
    return response({
      success: false,
      error: {
        code: 422,
        message: 'Invalid fields.',
      },
    });
  }
  const { name, email, password, marketingEmails, termsAccepted } = validatedFields.data;

  // Ensure terms are accepted
  if (!termsAccepted) {
    return response({
      success: false,
      error: {
        code: 422,
        message: 'You must accept the terms and services to continue.',
      },
    });
  }

  // Check if user already exist, then return an error.
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return response({
      success: false,
      error: {
        code: 422,
        message: 'Email address already exists. Please use another one.',
      },
    });
  }

  // Hash password that user entered.
  const hashedPassword = await hashPassword(password);

  // Create an user (without termsAccepted field as it's just for validation)
  const user = await createUser({ name, email, password: hashedPassword, marketingEmails });

  if (!user) {
    return response({
      success: false,
      error: {
        code: 500,
        message: 'Failed to create user. Please try again later.',
      },
    });
  }

  getActivityDispatcher().dispatchInfo(`New user registered: ${email}`, {
    userId: user.id,
    name,
    marketingConsent: marketingEmails,
    email: user.email,
  });

  // Add user to Brevo contact list based on marketing preferences
  try {
    await updateContactMarketingPreferences(email, marketingEmails, name);
    logger.debug('Updated contact marketing preferences in Brevo', {
      email,
      marketingEmails,
    });
  } catch (error) {
    // Don't fail registration if Brevo integration fails
    logger.error('Failed to update contact marketing preferences in Brevo', {
      error,
      email,
    });
  }

  // Generate verification token, then send it to the email.
  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token, name);

  // Automatically sign in the user after registration
  return await signInCredentials(email, password);
};
