'use client';

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Member = {
  id: number;
  name: string;
  value: number;
};

type Group = {
  id: number;
  GroupName: string;
};

export default function ExpensesPage() {
  const [expenseModal, setExpenseModal] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const [groupId, setGroupId] = useState<string>("");
  const [paidBy, setPaidBy] = useState("");

  const [splitType, setSplitType] = useState<"EQUAL" | "EXACT" | "PERCENTAGE">("EQUAL");
  const [groups, setGroups] = useState<Group[]>([]);

  const [members, setMembers] = useState<Member[]>([]);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [type, setType] = useState<"personal" | "group">("personal");
  const [loading, setLoading] = useState(false);

  // ---------------- FETCH ----------------
  const getExpenses = async () => {
    try {
      setLoading(true);

      const url =
        type === "personal"
          ? "/api/expenses/personal"
          : "/api/expenses/group";

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch expenses");

      const data = await res.json();

      setExpenses(data);
    } catch (err) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getExpenses();
    getGroups();
  }, [type]);

  // ---------------- SPLIT HELPERS ----------------
  const calculateEqualSplit = (amt: number) => {
    const perPerson = amt / members.length;

    return members.map((m) => ({
      userId: m.id,
      share: perPerson,
    }));
  };

  // ---------------- VALIDATION ----------------
  const validateSplit = () => {
    const amt = Number(amount);

    if (splitType === "EXACT") {
      const total = members.reduce((sum, m) => sum + m.value, 0);
      if (total !== amt) {
        toast.error("Exact split must equal total amount");
        return false;
      }
    }

    if (splitType === "PERCENTAGE") {
      const total = members.reduce((sum, m) => sum + m.value, 0);
      if (total !== 100) {
        toast.error("Percentage must equal 100%");
        return false;
      }
    }

    return true;
  };

  // ---------------- SUBMIT ----------------
  const handleAddExpense = async () => {
    try {
      if (!description.trim() || !amount) {
        toast.error("Please fill all required fields");
        return;
      }

      setLoading(true);

      const isGroupExpense = Boolean(groupId);

      // const payload: any = {
      //   description,
      //   amount: Number(amount),
      //   // ownerId: Number(paidBy),
      //   paidById: Number(paidBy),
      //   groupId: isGroupExpense ? Number(groupId) : null,
      // };

      const payload: any = {
        description,
        amount: Number(amount),
      };

      // GROUP EXPENSE
      if (isGroupExpense) {

        if (!paidBy) {
          toast.error("Please select who paid");
          return;
        }

        payload.groupId = Number(groupId);
        payload.paidById = Number(paidBy);

        let splits: any[] = [];

        if (splitType === "EQUAL") {
          const perPerson = Number(amount) / members.length;

          splits = members.map((m) => ({
            userId: m.id,
            share: perPerson,
          }));
        }

        if (splitType === "EXACT") {
          splits = members.map((m) => ({
            userId: m.id,
            share: Number(m.value),
          }));
        }

        if (splitType === "PERCENTAGE") {
          splits = members.map((m) => ({
            userId: m.id,
            share: (Number(amount) * Number(m.value)) / 100,
          }));
        }

        payload.splitType = splitType;
        payload.splits = splits;
      }

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create expense");
        return;
      }

      toast.success("Expense created successfully");

      // reset
      setExpenseModal(false);
      setDescription("");
      setAmount("");
      setGroupId("");
      setPaidBy("");
      setSplitType("EQUAL");
      setMembers((prev) =>
        prev.map((m) => ({ ...m, value: 0 }))
      );

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getMembers = async (groupId: number) => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      console.log("Members in group",res)

      if (!res.ok) throw new Error();

      const data = await res.json();

      console.log("Members",data);
      
      setMembers(
        data.map((user: any) => ({
          id: user.id,
          name: user.name,
          value: 0,
        }))
      );
    } catch (error) {
      toast.error("Failed to load group members");
    }
  };

  const getGroups = async () => {
    try {
      const res = await fetch("/api/groups");

      if (!res.ok) throw new Error();

      const data = await res.json();

      setGroups(data);
    } catch {
      toast.error("Failed to load groups");
    }
  };
  // ---------------- UI ----------------
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your shared expenses.
          </p>
        </div>

        <Button onClick={() => setExpenseModal(true)}>
          Add Expense
        </Button>
      </div>

      {/* TYPE SWITCH */}
      <div className="flex gap-2">
        <Button
          variant={type === "personal" ? "default" : "outline"}
          onClick={() => setType("personal")}
        >
          Personal
        </Button>

        <Button
          variant={type === "group" ? "default" : "outline"}
          onClick={() => setType("group")}
        >
          Group
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input placeholder="Search expenses..." className="pl-10" />
      </div>

      {/* EXPENSE LIST */}
      <div className="space-y-4">
        {expenses.map((expense) => (
          <div key={expense.id} className="border p-6 rounded-xl bg-white">

            <h2 className="text-xl font-semibold">
              {expense.description}
            </h2>

            <p className="text-sm text-gray-500">
              Paid by {expense.paidBy.fullname}
            </p>

            {expense.group && (
              <p className="text-xs text-gray-500 mt-1">
                Group: {expense.group.GroupName}
              </p>
            )}

            <p className="mt-2 font-bold">
              ₹{expense.amount}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {new Date(expense.createdAt).toLocaleDateString("en-IN")}
            </p>

            <p className="mt-2 text-sm">
              Splits: {expense.splits.length}
            </p>

            <div className="flex gap-3 mt-4">
              <Button variant="outline">Edit</Button>
              <Button variant="destructive">Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {expenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white w-150 p-6 rounded-xl space-y-4">

            <h2 className="text-xl font-bold">Add Expense</h2>

            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            {/* GROUP */}
            <select
              className="w-full border p-2 rounded"
              value={groupId}
              onChange={async (e) => {
                const id = e.target.value;

                setGroupId(id);
                setPaidBy("");

                if (id) {
                  await getMembers(Number(id));
                } else {
                  setMembers([]);
                }
              }}
            >
              <option value="">Personal</option>

              {groups.map((group) => (
                <option
                  key={group.id}
                  value={group.id}
                >
                  {group.GroupName}
                </option>
              ))}
            </select>

            {/* PAID BY */}
            {groupId && (
              <select
                className="w-full border p-2 rounded"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              >
                <option value="">Who paid?</option>

                {members.map((member) => (
                  <option
                    key={member.id}
                    value={member.id}
                    className="text-black"
                  >
                    {member.name}
                  </option>
                ))}
              </select>
            )}

            {/* SPLIT TYPE */}
            {groupId && (
              <>
                <select
                  className="w-full border p-2 rounded"
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value as any)}
                >
                  <option value="EQUAL">Equal</option>
                  <option value="EXACT">Exact</option>
                  <option value="PERCENTAGE">Percentage</option>
                </select>

                {/* MEMBERS */}
                <div className="space-y-3 border p-3 rounded">
                  {members.map((m, i) => (
                    <div key={m.id} className="flex justify-between items-center">
                      <span>{m.name}</span>

                      {splitType === "EQUAL" && <span>Auto</span>}

                      {splitType !== "EQUAL" && (
                        <Input
                          type="number"
                          className="w-24"
                          value={m.value}
                          onChange={(e) => {
                            const updated = [...members];
                            updated[i].value = Number(e.target.value);
                            setMembers(updated);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setExpenseModal(false)}>
                Cancel
              </Button>

              <Button onClick={handleAddExpense}>
                Add
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}