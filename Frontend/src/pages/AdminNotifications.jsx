import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-toastify";
import { useNotifications } from "@/contexts/NotificationContext";

export default function AdminNotifications() {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [target, setTarget] = useState("broadcast");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Admin Notifications</h1>
        <p className="text-sm text-gray-500">Admin access required.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const body = {
        title,
        message,
        type,
        userId: target === "targeted" ? userId : null,
      };
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to create notification");
      }
      toast.success("Notification created successfully!");
      setTitle("");
      setMessage("");
      setType("info");
      setTarget("broadcast");
      setUserId("");
      setTimeout(() => refreshNotifications(), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Notification title"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Notification message"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md px-3"
              >
                <option value="info">Info</option>
                <option value="event">Event</option>
                <option value="ticket">Ticket</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <Label>Target</Label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="broadcast"
                    checked={target === "broadcast"}
                    onChange={(e) => setTarget(e.target.value)}
                    className="mr-2"
                  />
                  Broadcast to all users
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="targeted"
                    checked={target === "targeted"}
                    onChange={(e) => setTarget(e.target.value)}
                    className="mr-2"
                  />
                  Targeted to specific user
                </label>
              </div>
            </div>
            {target === "targeted" && (
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  placeholder="Enter user ID"
                />
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Notification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
