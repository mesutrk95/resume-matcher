// app/_components/navbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditCard, UserRound } from "lucide-react";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { SubscriptionStatusIndicator } from "@/components/subscription/subscription-status-indicator";
import { LottieAnimatedIcon } from "./lottie-animated-icon";

function AuthNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="pr-4 rounded-none h-fit flex gap-x-2 focus-visible:ring-offset-0"
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
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex flex-col gap-y-2 py-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>
                <UserRound size={40} />
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg font-semibold">User Name</h3>
              <p className="text-sm">user@example.com</p>
              <p className="text-sm">Role</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings/billing">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing & Subscription
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form
          action={async () => {
            const { handleSignOut } = await import("@/actions/signout");
            await handleSignOut();
          }}
        >
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full flex justify-between">
              Log out
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavItem({
  link,
  title,
  icon,
}: {
  link: string;
  title: string;
  icon: string;
}) {
  return (
    <Link className="flex items-center gap-1.5" href={link}>
      <LottieAnimatedIcon icon={icon} /> {title}
    </Link>
  );
}

export default function Navbar() {
  return (
    //fixed top-0 bg-white w-full z-10
    <nav className="border-b bg-white">
      <div className="container">
        <div className="flex gap-x-4 items-center justify-between">
          <div className="flex gap-10 items-center text-sm font-medium">
            <img src="/logo.svg" className="h-[35px]" />
            <NavItem
              icon="/iconly/Inbox.json"
              title="Resume Templates"
              link="/templates"
            />
            {/* <Link className="flex gap-1" href="/templates">
              <LottieAnimatedIcon icon="/iconly/Inbox.json" /> Resume Templates
            </Link> */}
            <Link className="flex items-center gap-1.5" href="/jobs">
              <LottieAnimatedIcon icon="/iconly/Shoppingbag.json" /> Jobs
            </Link>
            <Link className="flex items-center gap-1.5" href="/resumes">
              <LottieAnimatedIcon icon="/iconly/emaildocument1.json" />
              Resumes
            </Link>
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
