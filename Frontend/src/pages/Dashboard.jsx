import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Ticket as TicketIcon, DollarSign } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { API_BASE_URL } from "@/config/api";
import Metric from "@/components/Metric";
import { PageLoading } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [revenuePoints, setRevenuePoints] = useState([]);
  const [perEvent, setPerEvent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revGranularity, setRevGranularity] = useState("day");
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [dashRes, perEventRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/dashboard`, { headers }),
        fetch(`${API_BASE_URL}/analytics/per-event`, { headers }),
      ]);
      if (!dashRes.ok) throw new Error(`Dashboard failed (${dashRes.status})`);
      if (!perEventRes.ok)
        throw new Error(`Per-event failed (${perEventRes.status})`);
      const dashData = await dashRes.json();
      const perEventData = await perEventRes.json();
      console.log("Dashboard data:", { dashData, perEventData });

      setStats(dashData);
      setPerEvent(perEventData.events || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async (granularity = revGranularity) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const from = new Date();
      from.setDate(from.getDate() - (granularity === "day" ? 14 : 180));
      const qs = new URLSearchParams({ from: from.toISOString(), granularity });
      const res = await fetch(`${API_BASE_URL}/analytics/revenue?${qs}`, {
        headers,
      });
      if (!res.ok) throw new Error("Revenue fetch failed");
      const data = await res.json();
      console.log("Revenue data:", data);
      
      setRevenuePoints(data.points || []);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") fetchAll();
  }, [user]);

  useEffect(() => {
    if (user && user.role === "admin") fetchRevenue();
  }, [user, revGranularity]);

  const lineData = useMemo(() => {
    const labels = revenuePoints.map((p) => p._id);
    return {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: revenuePoints.map((p) => p.revenue),
          borderColor: "#EF4444",
          backgroundColor: "rgba(239,68,68,0.15)",
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [revenuePoints]);

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => `Revenue: ${ctx.parsed.y}` } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "#eee" }, ticks: { precision: 0 } },
      },
    }),
    []
  );

  const donutData = useMemo(() => {
    const sliced = perEvent.slice(0, 6);
    return {
      labels: sliced.map((e) => e.title),
      datasets: [
        {
          data: sliced.map((e) => e.sold || 0),
          backgroundColor: [
            "#6366F1",
            "#22C55E",
            "#F59E0B",
            "#EF4444",
            "#8B5CF6",
            "#0EA5E9",
          ],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  }, [perEvent]);

  const donutOptions = useMemo(
    () => ({
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, font: { size: 10 } },
        },
      },
    }),
    []
  );

  if (user && user.role !== "admin") {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500">Admin access required.</p>
      </div>
    );
  }

  if (loading) return <PageLoading text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome {user?.name}</h1>
          <p className="text-xs text-gray-500 mt-1">System Administrator</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Metric
            label="Events"
            value={stats?.totalEvents ?? 0}
            icon={
              <CalendarDays
                size={18}
                className="text-blue-600"
              />
            }
            color="text-blue-600"
          />
          <Metric
            label="Bookings"
            value={stats?.totalTicketsSold ?? 0}
            icon={
              <TicketIcon
                size={18}
                className="text-yellow-600"
              />
            }
            color="text-yellow-600"
          />
          <Metric
            label="Revenue"
            value={(stats?.totalRevenue || 0).toLocaleString()}
            icon={
              <DollarSign
                size={18}
                className="text-green-600"
              />
            }
            color="text-green-600"
          />
        </div>
      </div>
      {error && (
        <div className="text-sm bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Net Sales</h2>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setRevGranularity("day")}
                className={`px-2.5 py-1 rounded-md border ${
                  revGranularity === "day" ? "bg-black text-white" : "bg-white"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setRevGranularity("month")}
                className={`px-2.5 py-1 rounded-md border ${
                  revGranularity === "month"
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="h-40 relative">
            {revenuePoints.length ? (
              <Line
                data={lineData}
                options={lineOptions}
              />
            ) : (
              <div className="text-xs text-gray-400">No data</div>
            )}
            {revenuePoints.length ? (
              <div className="absolute top-0 right-0 flex items-center gap-1 bg-white/80 backdrop-blur px-2 py-1 rounded-md border text-[10px] text-gray-600">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ background: "#EF4444" }}
                />
                Revenue
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center text-xs">
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <p className="font-semibold text-green-600">
                {(stats?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total Tickets</p>
              <p className="font-semibold">{stats?.totalTicketsSold || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Total Events</p>
              <p className="font-semibold">{stats?.totalEvents || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border flex flex-col">
          <h2 className="font-semibold mb-2">Customer Engagement</h2>
          <div className="h-60 flex items-center justify-center">
            {perEvent.length ? (
              <Doughnut
                data={donutData}
                options={donutOptions}
              />
            ) : (
              <div className="text-xs text-gray-400">No data</div>
            )}
          </div>
        </div>
      </div>
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Upcoming Events</h2>
            <a
              href="/events"
              className="text-xs text-blue-600 hover:underline"
            >
              See all
            </a>
          </div>
          <ul className="space-y-3 text-xs max-h-72 overflow-y-auto pr-1">
            {stats.upcomingEvents && stats.upcomingEvents.length ? (
              stats.upcomingEvents.map((ev) => (
                <li
                  key={ev._id}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-md bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                    {new Date(ev.date).toLocaleDateString(undefined, {
                      month: "short",
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ev.title}</p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(ev.date).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No upcoming events</li>
            )}
          </ul>
        </div>
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-sm border flex flex-col">
          <h2 className="font-semibold mb-3">Latest Event</h2>
          {stats.recentEvents && stats.recentEvents.length ? (
            <LatestEvent event={stats.recentEvents[0]} />
          ) : (
            <p className="text-xs text-gray-500">No recent events.</p>
          )}
        </div>
      </div>
      <div>
        <button
          onClick={async () => {
            try {
              const headers = token ? { Authorization: `Bearer ${token}` } : {};
              const res = await fetch(
                `${API_BASE_URL}/analytics/export/per-event.csv`,
                { headers }
              );
              if (!res.ok) throw new Error("Download failed");
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "event-stats.csv";
              document.body.appendChild(a);
              a.click();
              a.remove();
              setTimeout(() => URL.revokeObjectURL(url), 2000);
            } catch (e) {
              toast.error(e.message);
            }
          }}
          className="text-xs underline text-gray-600 hover:text-black"
        >
          Export per-event stats (CSV)
        </button>
      </div>
    </div>
  );
}

function LatestEvent({ event }) {
  const booked =
    event.seatMap?.filter((s) => s.status === "booked").length || 0;
  const available =
    event.seatMap?.filter((s) => s.status === "available").length || 0;
  const blocked =
    event.seatMap?.filter((s) => s.status === "blocked").length || 0;
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold">{event.title}</p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          {new Date(event.date).toLocaleDateString(undefined, {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-4 text-[10px]">
        <LegendSquare
          color="#6366F1"
          label="Booked"
          value={booked}
        />
        <LegendSquare
          color="#E5E7EB"
          label="Available"
          value={available}
        />
        <LegendSquare
          color="#9CA3AF"
          label="Blocked"
          value={blocked}
        />
      </div>
      <div className="grid grid-cols-12 gap-1.5 max-w-xl">
        {event.seatMap?.slice(0, 144).map((seat) => (
          <div
            key={seat.number}
            className="w-4 h-4 rounded-sm"
            style={{
              backgroundColor:
                seat.status === "booked"
                  ? "#6366F1"
                  : seat.status === "blocked"
                  ? "#9CA3AF"
                  : "#E5E7EB",
            }}
            title={`Seat ${seat.number} - ${seat.status}`}
          />
        ))}
      </div>
    </div>
  );
}

function LegendSquare({ color, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-3 h-3 rounded-sm"
        style={{ background: color }}
      />
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-400">({value})</span>
    </div>
  );
}
