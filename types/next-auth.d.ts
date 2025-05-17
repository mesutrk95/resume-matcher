import { UserRole } from '@prisma/client';
import { DefaultSession } from 'next-auth';

export type ExtendedUser = DefaultSession['user'] & {
  id: string;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  marketingEmails: boolean;
  emailVerified: Date | null;
};

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }
}

declare module '@auth/core/jwt' {
  type JWT = ExtendedUser;
}

// declare module "next-auth/providers/github" {
//   interface GithubProfile {
//     role: Role;
//   }
// }

// declare module "next-auth/providers/google" {
//   interface GoogleProfile {
//     role: Role;
//   }
// }
