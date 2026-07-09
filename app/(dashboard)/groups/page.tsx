'use client'

import { Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function Groups() {

  const [groupModel, setGroupModel] = useState(false);
  const [groupName, setGroupName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);


  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const getGroups = async () => {
    try {
      const res = await fetch("/api/groups");

      if (!res.ok) {
        throw new Error("Failed to fetch groups");
      }
      if (res.status === 401) return;

      const data = await res.json();

      setGroups(data);
    } catch (error) {
      if (status === "authenticated") {
        toast.error("Failed to load groups");
      }
    }
  };

  const getFriends = async () => {
    try {
      const res = await fetch("/api/friends");

      if (!res.ok) throw new Error();

      const data = await res.json();

      setFriends(data);
    } catch {
      if (status === "authenticated") {
        toast.error("Failed to load friends");
      }
    }
  };

  const openAddMemberModal = async (group: any) => {
    setSelectedGroup(group);

    await getFriends();

    setSelectedFriends([]);

    setAddMemberModal(true);
  };

  const handleAddMembers = async () => {
    try {
      if (!selectedGroup) return;

      if (selectedFriends.length === 0) {
        toast.error("Select at least one friend");
        return;
      }

      const res = await fetch("/api/groups/addmember", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: selectedGroup.id,
          friendIds: selectedFriends,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message);

      setAddMemberModal(false);

      getGroups();
    } catch {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    getGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Group created successfully");

      setGroupModel(false);
      setGroupName("");
      await getGroups();

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = (group: any) => {
    setIsEditing(true);
    setSelectedGroupId(group.id);
    setGroupName(group.GroupName);
    setGroupModel(true);
  };

  const handleUpdateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/groups/${selectedGroupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Group updated successfully");

      setGroupModel(false);
      setGroupName("");
      setSelectedGroupId(null);
      setIsEditing(false);

      await getGroups();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!search.trim()) {
        getGroups();
        return;
      }

      searchGroups();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const searchGroups = async () => {
    try {
      const res = await fetch(
        `/api/groups/search?name=${encodeURIComponent(search)}`
      );

      if (!res.ok) {
        throw new Error("Failed to search groups");
      }

      const data = await res.json();
      setGroups(data);
    } catch (error) {
      if (status === "authenticated") {
        toast.error("Failed to search groups");
      }
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  const availableFriends = friends.filter(
    (friend) =>
      !selectedGroup?.members.some(
        (member: any) => member.userId === friend.id
      )
  );

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

        <Button onClick={() => setGroupModel(true)}>Create Group</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

        <Input
          placeholder="Search groups..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
                  {group.GroupName}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Users size={16} />
                  {group.members.length}{" "}
                  {group.members.length === 1 ? "Member" : "Members"}
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase text-gray-500">
                    Expenses
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {group.expenses.length}
                  </p>
                </div>

                <div className="mt-4 flex items-center">
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 5).map((member: any) => (
                      <div
                        key={member.id}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-sm font-semibold text-white"
                      >
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>


                  {group.members.length > 5 && (
                    <span className="ml-3 text-sm text-gray-500">
                      +{group.members.length - 5} more
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-400">
                  Created by {group.user.name}<br />
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Total Expenses
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(group.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
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
                    {/* ₹{group.balance.toLocaleString()} */}
                  </h3>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-end gap-3 border-t pt-4">
              <Button
                variant="secondary"
                onClick={() => openAddMemberModal(group)}
              >
                Add Members
              </Button>

              <Button
                variant="outline"
                onClick={() => handleEditGroup(group)}
              >
                Edit
              </Button>

              <Button variant="destructive">
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Group Modal */}
      {groupModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                {isEditing ? "Edit Group" : "Create New Group"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isEditing
                  ? "Update the group name."
                  : "Give your group a memorable name."}
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Group Name
                </label>

                <input
                  type="text"
                  value={groupName}
                  placeholder="e.g. Goa Trip, Flat Expenses..."
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => {
                  setGroupModel(false);
                  setGroupName("");
                  setSelectedGroupId(null);
                  setIsEditing(false);
                }}
                className="rounded-lg border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={isEditing ? handleUpdateGroup : handleCreateGroup}
                className="rounded-lg bg-emerald-600 px-5 py-2 font-medium text-white hover:bg-emerald-700 transition"
              >
                {loading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Group"
                    : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {addMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-125 p-6">

            <h2 className="text-xl font-bold">
              Add Members
            </h2>

            <p className="text-gray-500 mb-5">
              {selectedGroup?.GroupName}
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto">

              {availableFriends.length === 0 && (
                <p className="text-gray-500">
                  All of your friends are already in this group.
                </p>
              )}

              {availableFriends.map((friend: any) => (
                <label
                  key={friend.id}
                  className="flex items-center justify-between border rounded-lg p-3 cursor-pointer"
                >
                  <div>
                    <p className="font-medium">
                      {friend.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {friend.email}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={selectedFriends.includes(friend.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFriends((prev) => [
                          ...prev,
                          friend.id,
                        ]);
                      } else {
                        setSelectedFriends((prev) =>
                          prev.filter((id) => id !== friend.id)
                        );
                      }
                    }}
                  />
                </label>
              ))}

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <Button
                variant="outline"
                onClick={() => setAddMemberModal(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleAddMembers}>
                Add Members
              </Button>

            </div>

          </div>
        </div>
      )}
    </div>

  );
}