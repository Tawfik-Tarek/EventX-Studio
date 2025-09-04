import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import arrow from "@/assets/Back Arrow.svg";
import ticket from "@/assets/Ticket.svg";
import seat from "@/assets/Flight Seat.svg";
import cash from "@/assets/Cash.svg";
import Field from "@/components/Field";
import Metric from "@/components/Metric";
import Legend from "@/components/Legend";
import EventFormModal from "@/components/EventFormModal";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";
import formatDate from "@/lib/format-date";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [cardLast4, setCardLast4] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/events/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch event (${res.status})`);
        const data = await res.json();
        console.log(data);

        const formattedEvent = {
          ...data,
          currency: "LKR",
          tags: data.tags || ["Event"],
          popularity: "High Popularity",
          expectedAttendance: data.totalSeats,
          paidSeats: data.totalSeats - data.availableSeats,
          reservedSeats: 0,
        };
        setEvent(formattedEvent);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEvent();
  }, [id]);

  if (loading) return <div className="p-6">Loading event details...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!event) return <div className="p-6">Event not found.</div>;

  const handleBookTicket = async () => {
    if (!selectedSeat || !cardLast4) return;
    if (isEventCreator) {
      alert(
        "As the event organizer, you cannot book tickets for your own event."
      );
      return;
    }
    setBookingLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/tickets/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: event._id,
          seatNumber: selectedSeat,
          amount: event.price,
          cardLast4: cardLast4,
        }),
      });
      if (!res.ok) throw new Error("Booking failed");
      const data = await res.json();
      alert("Ticket booked successfully!");
      setShowBookingModal(false);
      setSelectedSeat(null);
      setCardLast4("");
      window.location.reload();
    } catch (e) {
      alert("Error booking ticket: " + e.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const isEventCreator =
    user && user.role === "admin" && user._id === event.creatorId;

  const totalGridSeats = Math.min(80, event.totalSeats);
  const seatStatuses = event.seatMap
    ? event.seatMap.slice(0, totalGridSeats).map((seat) => seat.status)
    : Array.from({ length: totalGridSeats }, () => "available");

  return (
    <div className="bg-white rounded-2xl p-6 relative">
      <div className=" mb-4 text-center">
        <h2 className="text-2xl font-bold">Event Details</h2>
      </div>

      <div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Event Name"
              value={event.title}
            />
            <Field
              label="Event Date"
              value={formatDate(event.date)}
            />
            <Field
              label="Event Venue"
              value={event.venue}
              full
            />
            <Field
              label="Event Time"
              value={event.time}
            />
          </div>
          <Field
            label="Event Description"
            value={event.description}
            textarea
          />

          <div className="grid grid-cols-4 gap-4">
            <Metric
              icon={cash}
              label="Ticket Price"
              value={`${event.price}${event.currency}`}
              color="text-[#0F5D13]"
            />
            <Metric
              icon={seat}
              label="Seat Amount"
              value={event.totalSeats}
              color="text-black"
            />
            <Metric
              icon={ticket}
              label="Available Seats"
              value={event.availableSeats}
              color="text-[#8B2CF5]"
            />
            <Metric
              icon={ticket}
              label="Popularity"
              value={event.popularity}
              color="text-black"
            />
          </div>

          <div className="flex gap-6">
            <div className="flex-1 border rounded-xl p-4">
              <h3 className="font-semibold text-center mb-1">
                Seat Allocation
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                {isEventCreator
                  ? "As the event organizer, you cannot book tickets for your own event"
                  : "Click on a seat to book your ticket"}
              </p>
              <div className="flex justify-center gap-4 mb-4 text-sm">
                <Legend
                  color="bg-[#8B2CF5]"
                  label="Booked"
                />
                <Legend
                  color="bg-gray-500"
                  label="Blocked"
                />
                <Legend
                  color="bg-gray-300"
                  label={isEventCreator ? "Unavailable" : "Available"}
                />
              </div>
              <div className="grid grid-cols-10 gap-2 place-items-center">
                {seatStatuses.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (s === "available" && !isEventCreator) {
                        setSelectedSeat(i + 1);
                        setCardLast4("");
                        setShowBookingModal(true);
                      }
                    }}
                    className={`w-6 h-6 rounded-md ${
                      s === "booked"
                        ? "bg-[#8B2CF5] cursor-not-allowed"
                        : s === "blocked"
                        ? "bg-gray-500 cursor-not-allowed"
                        : isEventCreator
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gray-300 hover:bg-blue-300 cursor-pointer"
                    }`}
                    disabled={s !== "available" || isEventCreator}
                  />
                ))}
              </div>
            </div>

            <div className="w-64 space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full bg-[#F2F2F2] text-sm"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Expected Attendance</h4>
                <div className="px-3 py-2 border rounded-md font-medium">
                  +{event.expectedAttendance}
                </div>
              </div>
              <div className="border rounded-xl p-4 flex flex-col items-center text-center">
                <div className="w-40 h-40 bg-gray-200 flex items-center justify-center mb-3">
                  <span className="text-xs">QR CODE</span>
                </div>
                <p className="text-sm text-gray-600">
                  Scan QR code for easy payments
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 justify-end">
            {user && user.role === "admin" && (
              <>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="bg-[#D07D15] text-white font-semibold px-10 py-2 rounded-md"
                >
                  EDIT
                </button>
                <button
                  onClick={() => navigate(`/events/${event._id}/attendees`)}
                  className="bg-[#0F5D13] text-white font-semibold px-6 py-2 rounded-md"
                >
                  Attendee Insights
                </button>
              </>
            )}
            {user && !isEventCreator && (
              <>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="bg-[#0F5D13] text-white font-semibold px-6 py-2 rounded-md"
                  disabled={event.availableSeats === 0}
                >
                  {event.availableSeats === 0 ? "Sold Out" : "Book Ticket"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 rotate-180"
        aria-label="Back"
      >
        <img
          src={arrow}
          alt="Back"
          className="w-8 h-8"
        />
      </button>

      <Dialog
        open={showBookingModal}
        onOpenChange={(open) => {
          setShowBookingModal(open);
          if (!open) {
            setSelectedSeat(null);
            setCardLast4("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Event: {event.title}</p>
            <p>Selected Seat: {selectedSeat || "None"}</p>
            <p>
              Price: {event.price} {event.currency}
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">
                Card Last 4 Digits
              </label>
              <input
                type="text"
                value={cardLast4}
                onChange={(e) =>
                  setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="1234"
                className="w-full px-3 py-2 border rounded-md"
                maxLength={4}
              />
            </div>
            {!selectedSeat && (
              <p className="text-red-600">
                Please select a seat from the grid above.
              </p>
            )}
            {selectedSeat && cardLast4.length !== 4 && (
              <p className="text-red-600">
                Please enter the last 4 digits of your card.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBookingModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookTicket}
              disabled={
                !selectedSeat || cardLast4.length !== 4 || bookingLoading
              }
            >
              {bookingLoading ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EventFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        event={event}
        onSuccess={(updatedEvent) => {
          const formattedEvent = {
            ...updatedEvent,
            currency: "LKR",
            tags: updatedEvent.tags || ["Event"],
            popularity: "High Popularity",
            expectedAttendance: updatedEvent.totalSeats,
            paidSeats: updatedEvent.totalSeats - updatedEvent.availableSeats,
            reservedSeats: 0,
          };
          setEvent(formattedEvent);
          setShowEditModal(false);
        }}
      />
    </div>
  );
}
