'use server';

import { getActivityDispatcher } from '@/lib/activity-dispatcher/factory';
import { isExpired, response } from '@/lib/utils';
import { getUserByEmail, updateUserById } from '@/services/user';
import { deleteVerificationTokenById, getVerificationToken } from '@/services/verification-token';
import { redirect } from 'next/navigation';

export const newVerification = async (token: string) => {
  // Check if token doesn't exist, then return an error.
  const existingToken = await getVerificationToken(token);
  if (!existingToken) {
    return response({
      success: false,
      error: {
        code: 422,
        message: 'Invalid token provided.',
      },
    });
  }

  // Check if token has expired, then redirect to the resend form.
  const hasExpired = isExpired(existingToken.expires);
  if (hasExpired) {
    redirect('/resend');
  }

  // Check if email address doesn't exist, then return an error
  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return response({
      success: false,
      error: {
        code: 401,
        message: 'Email address does not exist.',
      },
    });
  }

  // Update user verified based on current datetime.
  await updateUserById(existingUser.id, {
    emailVerified: new Date(),
    email: existingToken.email,
  });

  await deleteVerificationTokenById(existingToken.id);

  getActivityDispatcher().dispatchInfo(`User verified email: ${existingToken.email}`, {
    userId: existingUser.id,
    email: existingToken.email,
    name: existingUser.name,
  });

  return response({
    success: true,
    code: 200,
    message: "Your email address has been verified. You're now logged in.",
  });
};
