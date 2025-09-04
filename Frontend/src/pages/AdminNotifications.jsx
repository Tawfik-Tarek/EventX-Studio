import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-toastify";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    type: z.enum(["info", "event", "ticket", "system"]),
    target: z.enum(["broadcast", "targeted"]),
    userId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.target === "targeted") {
        return data.userId && data.userId.trim() !== "";
      }
      return true;
    },
    {
      message: "User ID is required for targeted notifications",
      path: ["userId"],
    }
  );

export default function AdminNotifications() {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "info",
      target: "broadcast",
      userId: "",
    },
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Admin Notifications</h1>
        <p className="text-sm text-gray-500">Admin access required.</p>
      </div>
    );
  }

  const onSubmit = async (values) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const body = {
        title: values.title,
        message: values.message,
        type: values.type,
        userId: values.target === "targeted" ? values.userId : null,
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
      form.reset();
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
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="grid gap-4">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Notification title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="grid gap-4">
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notification message"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="grid gap-4">
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="ticket">Ticket</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem className="grid gap-4">
                    <FormLabel>Target</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="broadcast"
                            id="broadcast"
                          />
                          <label
                            htmlFor="broadcast"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Broadcast to all users
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="targeted"
                            id="targeted"
                          />
                          <label
                            htmlFor="targeted"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Targeted to specific user
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("target") === "targeted" && (
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem className="grid gap-4">
                      <FormLabel>User ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter user ID"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Creating..." : "Create Notification"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
