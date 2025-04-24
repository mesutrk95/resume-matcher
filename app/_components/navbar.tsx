'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreditCard, FileUser, LogOut, Settings2, User2, UserRound } from 'lucide-react';
import Link from 'next/link';
import { SubscriptionStatusIndicator } from '@/components/subscription/subscription-status-indicator';
import { LottieAnimatedIcon } from './lottie-animated-icon';
import { useUser } from '@/providers/UserProvider';
import Image from 'next/image';

function AuthNav() {
  const { user } = useUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className=" rounded-none h-fit flex gap-x-2 focus-visible:ring-offset-0 px-0"
        >
          <Avatar>
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>
              <UserRound />
            </AvatarFallback>
          </Avatar>
          {/* <p>User</p> */}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator /> */}
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex flex-col gap-y-2 py-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>
                <UserRound size={40} />
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{user?.name}</h3>
              <p className="text-sm">{user?.email}</p>
              {/* <p className="text-sm">Role</p> */}
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User2 className="me-1 " />
              Profile
              {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/career-profiles">
              <FileUser className="me-1 " />
              Career Profiles
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings/billing">
              <CreditCard className="me-1 " />
              Billing & Subscription
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings2 className="me-1 " />
              Settings
              {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form
          action={async () => {
            const { handleSignOut } = await import('@/actions/signout');
            await handleSignOut();
          }}
        >
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full flex ">
              <LogOut className="me-1 " />
              Log out
              {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavItem({ link, title, icon }: { link: string; title: string; icon: string }) {
  return (
    <Link className="py-2 px-3" href={link}>
      <div className="effect-link flex items-center gap-1.5 ">
        <LottieAnimatedIcon icon={icon} />
        <span data-hover={title}>{title}</span>
      </div>
    </Link>
  );
}

export default function Navbar() {
  return (
    <nav className="border-b bg-white top-0 w-full z-10 sticky shadow-xs">
      <div className="container ">
        {/* Include the CSS */}
        <div className="flex gap-x-4 items-center justify-between">
          <div className="flex gap-2 items-center text-sm font-medium navbar-hover-effect">
            <Image src="/logos/text-logo-outlines.svg" width={120} height={35} alt="Logo" />
            {/* <NavItem
              icon="/iconly/Inbox.json"
              title="Resume Templates"
              link="/templates"
            /> */}
            <NavItem icon="/iconly/emaildocument1.json" title="Resumes" link="/resumes" />
            <NavItem icon="/iconly/Shoppingbag.json" title="Jobs" link="/jobs" />
          </div>
          <div className="flex items-center gap-4">
            <SubscriptionStatusIndicator />
            <AuthNav />
          </div>
        </div>
      </div>
    </nav>
  );
}
