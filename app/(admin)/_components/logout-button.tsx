'use client';

import { handleSignOut } from '@/actions/signout';

export function LogoutButton() {
  return (
    <form action={handleSignOut}>
      <button
        type="submit"
        className="w-full text-left p-2 rounded hover:bg-slate-800 transition text-red-400"
      >
        Logout
      </button>
    </form>
  );
}
