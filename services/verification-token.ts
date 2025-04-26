import { db } from '@/lib/db';
import { setTokenExpiration } from '@/lib/utils';
import { v4 as uuid } from 'uuid';
import { VerificationToken } from '@prisma/client';

// Extended verification token type with cooldown information
export type VerificationTokenWithCooldown = VerificationToken & {
  cooldownActive: boolean;
  remainingMinutes: number;
};

export const generateVerificationToken = async (
  email: string,
): Promise<VerificationTokenWithCooldown> => {
  const existingToken = await getVerificationTokenByEmail(email);

  // Check if there's an existing token created less than 10 minutes ago
  if (existingToken) {
    // Use the actual createdAt field from the database
    const tokenCreationTime = new Date(existingToken.createdAt);
    const timeSinceCreation = new Date().getTime() - tokenCreationTime.getTime();
    const tenMinutesInMs = 10 * 60 * 1000;

    // If token was created less than 10 minutes ago, return the existing token with an error flag
    if (timeSinceCreation < tenMinutesInMs) {
      const remainingTimeInMinutes = Math.ceil((tenMinutesInMs - timeSinceCreation) / 60000);
      return {
        ...existingToken,
        cooldownActive: true,
        remainingMinutes: remainingTimeInMinutes,
      };
    }

    // If token is older than 10 minutes, delete it and create a new one
    await deleteVerificationTokenById(existingToken.id);
  }

  const token = uuid();
  const expires = setTokenExpiration();

  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return {
    ...verificationToken,
    cooldownActive: false,
    remainingMinutes: 0,
  };
};

export const getVerificationToken = async (token: string) => {
  try {
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    return verificationToken;
  } catch {
    return null;
  }
};

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db.verificationToken.findFirst({
      where: { email },
    });

    return verificationToken;
  } catch {
    return null;
  }
};

export const deleteVerificationTokenById = async (id: string) => {
  try {
    return await db.verificationToken.delete({
      where: { id },
    });
  } catch {
    return null;
  }
};
