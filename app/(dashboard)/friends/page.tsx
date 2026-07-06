'use client';

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, Clock, Users } from "lucide-react";
import { toast } from "react-toastify";

type Friend = {
  id: number;
  name: string;
  username: string;
  email: string;
};

type FriendRequest = {
  id: string;
  sender: {
    id: number;
    name: string;
    email: string;
    username: string;
  };
};

export default function Friends() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);

  // ---------------- FETCH FRIENDS ----------------
  const getFriends = async () => {
  try {
    const res = await fetch("/api/friends");

    if (!res.ok) {
      throw new Error();
    }

    const data = await res.json();
    setFriends(data);
  } catch (error) {
    console.error(error);
    toast.error("Failed to load friends");
  }
};

  useEffect(() => {
    getFriends();
    getPendingRequests();
  }, []);

  // ---------------- SEND REQUEST ----------------
  const sendRequest = async () => {
    try {
      if (!email.trim()) {
        toast.error("Enter email");
        return;
      }

      setLoading(true);

      // 1. first get userId from email
      const userRes = await fetch(
        `/api/friends/search?email=${encodeURIComponent(email)}`
      );

      const userData = await userRes.json();

      if (!userRes.ok) {
        toast.error(userData.message);
        return;
      }

      const receiverId = userData.id;

      // 2. send friend request using receiverId
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Friend request sent");
      setEmail("");
      getFriends();
      await getPendingRequests();

    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getPendingRequests = async () => {
    try {
      const res = await fetch("/api/friends/request");

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setPendingRequests(data);
    } catch (error) {
      toast.error("Failed to load pending requests");
    }
  };


  const acceptRequest = async (requestId: string) => {
    try {
      setLoading(true);

      const res = await fetch("/api/friends/request/accept", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Friend request accepted");

      await getPendingRequests();
      await getFriends();

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const res = await fetch("/api/friends/request/reject", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message);

      await Promise.all([
        getPendingRequests(),
        getFriends(),
      ]);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const removeFriend = async (friendId: number) => {
  try {
    const res = await fetch(`/api/friends/request?friendId=${friendId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    toast.success(data.message);

    getFriends();
  } catch (err) {
    toast.error("Something went wrong");
  }
};

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Friends</h1>
        <p className="text-gray-500">
          Connect with friends and split expenses easily.
        </p>
      </div>

      {/* SEARCH / ADD FRIEND */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search friend by email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button onClick={sendRequest} disabled={loading}>
          <UserPlus className="w-4 h-4 mr-2" />
          {loading ? "Sending..." : "Add"}
        </Button>
      </div>

      {/* ACCEPTED FRIENDS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Users className="w-5 h-5" />
          Friends ({friends.length})
        </div>

        {friends.length === 0 ? (
          <p className="text-sm text-gray-500">No friends yet</p>
        ) : (
          <div className="grid gap-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between border rounded-lg p-4 bg-white"
              >
                <div>
                  <p className="font-semibold">{friend.name}</p>
                  <p className="text-sm text-gray-500">{friend.email}</p>
                </div>

                <span className="text-green-600 text-sm font-medium">
                  Accepted
                </span>
                <span className="text-red-500 text-sm font-medium cursor-pointer" onClick={() => removeFriend(friend.id)}>
                  Remove Friend
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PENDING REQUESTS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="w-5 h-5" />
          Pending Requests ({pendingRequests.length})
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No pending requests</p>
        ) : (
          <div className="grid gap-3">
            {pendingRequests.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between border rounded-lg p-4 bg-white"
              >
                <div>
                  <p className="font-semibold">
                    {friend.sender.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {friend.sender.email}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => acceptRequest(friend.id)}>
                    Accept
                  </Button>

                  <Button size="sm" variant="destructive" onClick={() => rejectRequest(friend.id)}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}