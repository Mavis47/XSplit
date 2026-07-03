import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


const expenses = [
  {
    id: 1,
    title: "Dinner at BBQ Nation",
    amount: 1200,
    owe: 300,
    owed: 900,
    oweTo: "Rahul",
    owedFrom: "Amit & Priya",
    date: "03 Jul 2026",
    time: "7:45 PM",
  },
  {
    id: 2,
    title: "Movie Night",
    amount: 800,
    owe: 0,
    owed: 800,
    oweTo: "Settled Up",
    owedFrom: "Neha & Karan",
    date: "01 Jul 2026",
    time: "9:20 PM",
  },
];

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      {/* Top */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your shared expenses.
          </p>
        </div>

        <Button className="cursor-pointer">Add Expense</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

        <Input
          placeholder="Search expenses..."
          className="pl-10"
        />
      </div>

      {/* Expenses */}
      <div className="space-y-4">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            {/* Header */}
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {expense.title}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  You created this expense
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {expense.date} • {expense.time}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Total Amount
                </p>

                <h2 className="text-2xl font-bold">
                  ₹{expense.amount}
                </h2>
              </div>
            </div>

            {/* Middle */}
            <div className="mt-6 grid grid-cols-2 gap-6 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-xs uppercase text-gray-500">
                  You Owe
                </p>

                <h3 className="mt-1 text-2xl font-bold text-red-600">
                  ₹{expense.owe}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  To {expense.oweTo}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">
                  You Are Owed
                </p>

                <h3 className="mt-1 text-2xl font-bold text-green-600">
                  ₹{expense.owed}
                </h3>

                <p className="mt-1 text-sm text-gray-600">
                  From {expense.owedFrom}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-500">
                {expense.owe > 0
                  ? "Payment Pending"
                  : expense.owed > 0
                    ? "Waiting for payment"
                    : "Settled"}
              </div>

              <div className="flex gap-3">
                {(expense.owe > 0 || expense.owed > 0) && (
                  <Button className="bg-green-600 hover:bg-green-700 cursor-pointer">
                    Settle Up
                  </Button>
                )}

                <Button variant="outline" className="cursor-pointer">
                  Edit
                </Button>

                <Button variant="destructive" className="cursor-pointer">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}