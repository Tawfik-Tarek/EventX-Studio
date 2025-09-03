import cash from "../assets/Cash.svg";
import seat from "../assets/Flight Seat.svg";
import ticket from "../assets/Ticket.svg";
import arrow from "../assets/Back Arrow.svg";
import { Separator } from "./ui/separator";
import { useNavigate } from "react-router-dom";

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const goToDetails = () => navigate(`/events/${event.id || 1}`);
  return (
    <div
      onClick={goToDetails}
      className="bg-white w-[342px] h-[240px] rounded-[20px] stroke-1 shadow-md text-black px-4 py-5 relative cursor-pointer hover:shadow-lg transition-shadow"
    >
      <h3 className="text-lg font-bold">{event.title}</h3>
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
            {event.totalSeats - event.availableSeats}
          </span>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-col gap-1">
        <span className="text-[#666666]">
          Venue : <span className="text-black font-medium">{event.venue}</span>
        </span>
        <span className="text-[#666666]">
          Date : <span className="text-black font-medium">{event.date}</span>
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
  );
}
