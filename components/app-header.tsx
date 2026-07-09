"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { useUser } from "@/app/context/UserContext";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function AppHeader() {
  const { user, loading } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);

  const initial = user?.fullname?.charAt(0) || "?";
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Expense", href: "/expenses" },
    { name: "Groups", href: "/groups" },
    { name: "Friends", href: "/friends" },
  ];

  const getNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");

      if (!res.ok) return;

      const data = await res.json();

      console.log("Res in notifications", res);


      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "PATCH",
      });

      if (!res.ok) return;

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        Loading...
      </header>
    );
  }
  const unreadCount = notifications.filter(
    (n) => !n.isRead
  ).length;

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      {/* Left */}
      <div className="flex items-center gap-4 rounded-xl border bg-white p-2 shadow-sm">
        <Avatar className="h-12 w-12 border">
          <AvatarImage
            src={user?.image || ""}
            alt={user?.username || user?.fullname || "User"}
          />

          <AvatarFallback className="bg-black text-lg font-bold text-white">
            {(
              user?.username?.[0] ||
              user?.fullname?.[0] ||
              "?"
            ).toUpperCase()}
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
        <Popover
          open={open}
          onOpenChange={(value) => {
            setOpen(value);

            if (value) {
              markAllAsRead();
            }
          }}

        >
          <PopoverTrigger asChild>
            <button className="relative">
              <Bell className="h-6 w-6 cursor-pointer" />

              {unreadCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full  bg-red-500 px-1 
                  text-[10px] font-bold  text-white"
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            className="w-96 p-0"
          >
            <div className="border-b p-4">
              <h2 className="text-lg font-bold">
                Notifications
              </h2>
            </div>

            <div className="max-h-112.5 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-6 text-center text-gray-500">
                  No notifications
                </p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b p-4 transition hover:bg-gray-50 ${!notification.isRead
                      ? "bg-blue-50"
                      : ""
                      }`}
                  >
                    <p className="text-sm">
                      {notification.message}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

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