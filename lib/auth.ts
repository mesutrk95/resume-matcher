import { auth } from '@/auth';
import { UserRole } from '@prisma/client';

export const currentUser = async () => {
  const session = await auth();

  if (!session?.user) throw 'user not found!';
  return session.user;
};

export const currentRole = async () => {
  const session = await auth();

  return session?.user.role;
};

export const currentAdmin = async () => {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  if (session.user.role !== UserRole.Admin) {
    return null;
  }

  return session?.user;
};
