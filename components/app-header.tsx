"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { useUser } from "@/app/context/UserContext";

export default function AppHeader() {
  const { user, loading } = useUser();

  const initial = user?.fullname?.charAt(0) || "?";

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Expense", href: "/expenses" },
    { name: "Groups", href: "/groups" },
    { name: "Friends", href: "/friends" },
  ];

  if (loading) {
    return (
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        Loading...
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      {/* Left */}
      <div className="flex items-center gap-4 rounded-xl border bg-white p-2 shadow-sm">
        <Avatar className="h-12 w-12 border">
          <AvatarFallback className="bg-black text-lg font-bold text-white">
            {user?.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-gray-900">
            {user?.fullname}
          </h3>

          <p className="text-sm text-gray-500">
            @{user?.username}
          </p>

          <p className="text-sm text-gray-500">
            {user?.email}
          </p>
        </div>
      </div>

      {/* Center */}
      <nav className="rounded-full border bg-gray-50 p-1 shadow-sm">
        <ul className="flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-full px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-black hover:shadow-sm"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Right */}
      <div className="flex items-center gap-4">
        <Bell className="cursor-pointer" />

        <Button
          variant="destructive"
          className="cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}