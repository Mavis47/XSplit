import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const groups = [
  {
    id: 1,
    name: "Goa Trip",
    members: 5,
    totalExpense: 12500,
    balance: -1200,
    createdAt: "02 Jul 2026",
  },
  {
    id: 2,
    name: "Office Lunch",
    members: 8,
    totalExpense: 5600,
    balance: 850,
    createdAt: "30 Jun 2026",
  },
];

export default function Groups() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">
            Manage your shared expense groups.
          </p>
        </div>

        <Button>Create Group</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

        <Input
          placeholder="Search groups..."
          className="pl-10"
        />
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            {/* Top */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {group.name}
                </h2>

                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Users size={16} />
                  {group.members} Members
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Created on {group.createdAt}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Total Expenses
                </p>

                <h2 className="text-2xl font-bold">
                  ₹{group.totalExpense.toLocaleString()}
                </h2>
              </div>
            </div>

            {/* Balance */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              {group.balance < 0 ? (
                <>
                  <p className="text-xs uppercase text-gray-500">
                    You Owe
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-red-600">
                    ₹{Math.abs(group.balance).toLocaleString()}
                  </h3>
                </>
              ) : (
                <>
                  <p className="text-xs uppercase text-gray-500">
                    You Are Owed
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-green-600">
                    ₹{group.balance.toLocaleString()}
                  </h3>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-end gap-3 border-t pt-4">
              <Button>View Group</Button>

              <Button variant="outline">
                Edit
              </Button>

              <Button variant="destructive">
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}