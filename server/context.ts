// import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { auth } from '@/auth';
import { ExtendedUser } from '@/types/next-auth';

export type TrpcContextOptions = {
  session: {
    user?: ExtendedUser;
  };
};

export async function createContext() {
  const session = (await auth()) || {};

  return {
    session,
    // Add other context properties (like database)
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
