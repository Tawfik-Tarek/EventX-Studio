import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";

export default function EventFormModal({ isOpen, onClose, event, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        date: event.date
          ? new Date(event.date).toISOString().split("T")[0]
          : "",
        time: event.time,
        venue: event.venue,
        price: event.price,
        totalSeats: event.totalSeats,
      });
    } else {
      reset({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        price: "",
        totalSeats: "",
      });
    }
  }, [event, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const url = event
        ? `${API_BASE_URL}/events/${event._id}`
        : `${API_BASE_URL}/events`;
      const method = event ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          price: Number(data.price),
          totalSeats: Number(data.totalSeats),
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save event");
      }
      const savedEvent = await response.json();
      onSuccess(savedEvent);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {event ? "Edit Event" : "Create Event"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium"
              >
                Event Title
              </Label>
              <Input
                id="title"
                placeholder="Enter event title"
                {...register("title", { required: "Title is required" })}
                className="mt-1"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium"
              >
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter event description"
                {...register("description", {
                  required: "Description is required",
                })}
                className="mt-1"
                rows={4}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="date"
                className="text-sm font-medium"
              >
                Date
              </Label>
              <Input
                id="date"
                type="date"
                {...register("date", { required: "Date is required" })}
                className="mt-1"
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.date.message}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="time"
                className="text-sm font-medium"
              >
                Time
              </Label>
              <Input
                id="time"
                placeholder="e.g., 10:00 AM"
                {...register("time", { required: "Time is required" })}
                className="mt-1"
              />
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.time.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <Label
                htmlFor="venue"
                className="text-sm font-medium"
              >
                Venue
              </Label>
              <Input
                id="venue"
                placeholder="Enter venue location"
                {...register("venue", { required: "Venue is required" })}
                className="mt-1"
              />
              {errors.venue && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.venue.message}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="price"
                className="text-sm font-medium"
              >
                Price (LKR)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
                className="mt-1"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="totalSeats"
                className="text-sm font-medium"
              >
                Total Seats
              </Label>
              <Input
                id="totalSeats"
                type="number"
                placeholder="100"
                {...register("totalSeats", {
                  required: "Total seats is required",
                  min: { value: 1, message: "At least 1 seat" },
                })}
                className="mt-1"
              />
              {errors.totalSeats && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.totalSeats.message}
                </p>
              )}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6"
            >
              {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
