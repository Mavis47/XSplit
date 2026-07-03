import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface AppHeaderProps {
    initial: string;
}

export default function AppHeader({ initial }: AppHeaderProps) {
    const navItems = [
        { name: "Home", href: "/" },
        { name: "Expense", href: "/expenses" },
        { name: "Groups", href: "/groups" },
        { name: "Friends", href: "/friends" },
    ];

    return (
        <header className="flex items-center justify-between border-b bg-white px-6 py-4">
            {/* Left Avatar */}
            <Avatar className="h-10 w-10 border">
                <AvatarFallback className="bg-black text-sm font-semibold text-white">
                    {initial.toUpperCase()}
                </AvatarFallback>
            </Avatar>

            {/* Center Navigation */}
            <nav className="rounded-full border border-gray-200 bg-gray-50 p-1 shadow-sm">
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

            {/* Spacer to keep nav centered */}
            <div className="flex items-center justify-end gap-4">
                <Bell className="cursor-pointer" />
                <Button className="p-5 cursor-pointer" variant="destructive">
                    <LogOut className="cursor-pointer" /> 
                    <span>Logout</span>
                </Button>
            </div>
        </header>
    );
}