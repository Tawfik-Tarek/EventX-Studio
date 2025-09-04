import { useState, useEffect, useRef } from "react";
import cash from "../assets/Cash.svg";
import seat from "../assets/Flight Seat.svg";
import ticket from "../assets/Ticket.svg";
import arrow from "../assets/Back Arrow.svg";
import { Separator } from "./ui/separator";
import { useNavigate } from "react-router-dom";
import formatDate from "@/lib/format-date";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/config/api";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function EventCard({ event, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);
  const eventId = event.id || event._id || 1;
  const goToDetails = () => navigate(`/events/${eventId}`);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete event");
      }

      toast.success("Event deleted successfully!");
      if (onDelete) {
        onDelete(eventId);
      }
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Error deleting event: " + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const isAdmin = user && user.role === "admin";

  return (
    <>
      <div
        onClick={goToDetails}
        className="bg-white w-[342px] h-[240px] rounded-[20px] stroke-1 shadow-md text-black px-4 py-5 relative cursor-pointer hover:shadow-lg transition-shadow"
      >
        {isAdmin && (
          <div
            ref={menuRef}
            className="absolute top-3 right-3 z-10"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <span className="text-gray-600 text-lg">⋮</span>
            </button>
            {showMenu && (
              <div className="absolute top-10 right-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px] z-20">
                <button
                  onClick={handleDeleteClick}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        <h3 className={`text-lg font-bold ${isAdmin ? "pr-12" : ""}`}>
          {event.title.length >= (isAdmin ? 25 : 30)
            ? event.title.slice(0, isAdmin ? 25 : 30) + "..."
            : event.title}
        </h3>
        <div className="flex justify-between mt-4 mb-3">
          <div className="flex items-center">
            <img
              src={cash}
              alt="Cash"
              className="w-5 h-5"
            />
            <span className="ml-1 text-[#0F5D13]">{event.price}</span>
          </div>
          <div className="flex items-center">
            <img
              src={seat}
              alt="Seat"
              className="w-5 h-5"
            />
            <span className="ml-1 text-[#EB3223]">{event.totalSeats}</span>
          </div>
          <div className="flex items-center">
            <img
              src={ticket}
              alt="Ticket"
              className="w-5 h-5"
            />
            <span className="ml-1 text-[#8B2CF5]">
              {typeof event.availableSeats === "number" &&
              typeof event.totalSeats === "number"
                ? event.totalSeats - event.availableSeats
                : "-"}
            </span>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex flex-col gap-1">
          <span className="text-[#666666]">
            Venue :{" "}
            <span className="text-black font-medium">{event.venue}</span>
          </span>
          <span className="text-[#666666]">
            Date :{" "}
            <span className="text-black font-medium">
              {formatDate(event.date)}
            </span>
          </span>
          <span className="text-[#666666]">
            Time : <span className="text-black font-medium">{event.time}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToDetails();
          }}
          className="absolute bottom-4 right-4 cursor-pointer"
        >
          <img
            src={arrow}
            alt="Back Arrow"
            className="w-10 h-10"
          />
        </button>
      </div>

      <Dialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{event.title}"</strong>?
              This action cannot be undone and will permanently remove the event
              and all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
