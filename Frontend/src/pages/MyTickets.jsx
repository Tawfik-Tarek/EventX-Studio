import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import formatDate from "@/lib/format-date";
import { toast } from "react-toastify";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/tickets/my-tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch tickets");
        const data = await res.json();
        setTickets(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading) return <div className="p-6">Loading tickets...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="bg-white rounded-2xl p-6">
      <h2 className="text-2xl font-bold mb-6">My Tickets</h2>
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{ticket.eventId?.title}</h3>
                <p className="text-sm text-gray-600">
                  {formatDate(ticket.eventId?.date)} at {ticket.eventId?.venue}
                </p>
                <p className="text-sm">Seat: {ticket.seatNumber}</p>
                <p className="text-sm">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      ticket.status === "booked"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {ticket.qrCode && ticket.status === "booked" && (
                  <img
                    src={ticket.qrCode}
                    alt="QR Code"
                    className="w-20 h-20"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
