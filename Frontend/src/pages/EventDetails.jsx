import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import arrow from "@/assets/Back Arrow.svg";
import ticket from "@/assets/Ticket.svg";
import seat from "@/assets/Flight Seat.svg";
import cash from "@/assets/Cash.svg";

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Colombo Music Festival 2025",
    venue: "Viharamahadevi Open Air Theater, Colombo",
    description:
      "Get ready for Sri Lanka's biggest music festival – the Colombo Music Festival 2025! 🎉🔥 This electrifying open-air concert will feature top international and local artists, bringing an unforgettable night of music, lights, and energy to the heart of Colombo! Join 10,000+ music lovers at the Viharamahadevi Open Air Theater for a night filled with live performances, immersive stage effects, and a festival atmosphere like no other! Whether you're into pop, rock, EDM, or reggae, this festival has something for every music enthusiast!",
    price: 2500,
    currency: "LKR",
    totalSeats: 1200,
    availableSeats: 523,
    popularity: "High Popularity",
    tags: ["Music", "Festival"],
    expectedAttendance: 1000,
    date: "April 12, 2025",
    time: "6.00PM - 10.30PM",
    paidSeats: 420,
    reservedSeats: 257,
  },
];

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const found = MOCK_EVENTS.find((e) => e.id === id) || MOCK_EVENTS[0];
    setEvent(found);
  }, [id]);

  if (!event) return null;

  // Generate seat map (simple grid 10x8) with statuses
  const totalGridSeats = 80; // 10 x 8
  const seatStatuses = Array.from({ length: totalGridSeats }, (_, i) => {
    if (i < event.paidSeats) return "paid";
    if (i < event.paidSeats + event.reservedSeats) return "reserved";
    return "available";
  });

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
              value={event.date}
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
              <h3 className="font-semibold text-center mb-4">
                Seat Allocation
              </h3>
              <div className="flex justify-center gap-4 mb-4 text-sm">
                <Legend
                  color="bg-[#8B2CF5]"
                  label="Paid Seats"
                />
                <Legend
                  color="bg-[#5A3FBE]"
                  label="Reserved Seats"
                />
                <Legend
                  color="bg-gray-300"
                  label="Available"
                />
              </div>
              <div className="grid grid-cols-10 gap-2 place-items-center">
                {seatStatuses.map((s, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-md ${
                      s === "paid"
                        ? "bg-[#8B2CF5]"
                        : s === "reserved"
                        ? "bg-[#5A3FBE]"
                        : "bg-gray-300"
                    }`}
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

          <div className="flex gap-4 pt-4">
            <button className="bg-[#D07D15] text-white font-semibold px-10 py-2 rounded-md">
              EDIT
            </button>
            <button className="bg-[#0F5D13] text-white font-semibold px-6 py-2 rounded-md">
              Attendee Insights
            </button>
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
    </div>
  );
}

function Field({ label, value, textarea, full }) {
  return (
    <div className={`${full ? "col-span-2" : ""}`}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {textarea ? (
        <div className="p-3 border rounded-md text-sm leading-snug max-h-40 overflow-y-auto whitespace-pre-line">
          {value}
        </div>
      ) : (
        <div className="px-3 py-2 border rounded-md text-sm font-medium bg-white">
          {value}
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value, color }) {
  return (
    <div className="border rounded-xl p-3 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <img
          src={icon}
          alt={label}
          className="w-5 h-5"
        />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <span className={`text-base font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}
