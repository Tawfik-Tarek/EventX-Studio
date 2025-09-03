import { useEffect, useState } from "react";
import { UserCircle2, Users, MapPin, Star, BarChart3 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { API_BASE_URL } from "@/config/api";
import Metric from "@/components/Metric";
import { PageLoading } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  ChartLegend
);

export default function AttendeeInsights() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE_URL}/analytics/demographics`, {
        headers,
      });
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") fetchData();
  }, [user]);

  if (user && user.role !== "admin") {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-2">Attendee Insights</h1>
        <p className="text-sm text-gray-500">Admin access required.</p>
      </div>
    );
  }

  if (loading) return <PageLoading text="Loading attendee insights..." />;

  const ageGroups = data?.ageGroups || {};
  const genderDistribution = data?.genderDistribution || {};
  const interests = data?.interests || {};
  const locations = data?.locations || {};

  const topAge = Object.entries(ageGroups).sort((a, b) => b[1] - a[1])[0];
  const topGender = Object.entries(genderDistribution).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const topLocation = Object.entries(locations).sort((a, b) => b[1] - a[1])[0];
  const topInterest = Object.entries(interests).sort((a, b) => b[1] - a[1])[0];

  const totalAttendees = Object.values(genderDistribution).reduce(
    (s, v) => s + v,
    0
  );

  const locEntries = Object.entries(locations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const locationsData = {
    labels: locEntries.map((l) => l[0]),
    datasets: [
      {
        label: "Attendees",
        data: locEntries.map((l) => l[1]),
        backgroundColor: [
          "#2563EB",
          "#DC2626",
          "#059669",
          "#8B5CF6",
          "#111827",
          "#F59E0B",
          "#0EA5E9",
          "#84CC16",
        ],
        borderRadius: 6,
      },
    ],
  };
  const locationsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        grid: { color: "#eee" },
        ticks: { precision: 0, font: { size: 10 } },
      },
    },
  };

  const interestEntries = Object.entries(interests).sort((a, b) => b[1] - a[1]);
  const interestsData = {
    labels: interestEntries.map((i) => i[0]),
    datasets: [
      {
        data: interestEntries.map((i) => i[1]),
        backgroundColor: [
          "#6366F1",
          "#22C55E",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#0EA5E9",
        ],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
  const interestsOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12, font: { size: 10 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${ctx.parsed} (${percent(
              ctx.parsed,
              interestEntries
            )})`,
        },
      },
    },
  };

  const ageEntries = Object.entries(ageGroups);
  const ageData = {
    labels: ageEntries.map((a) => a[0]),
    datasets: [
      {
        data: ageEntries.map((a) => a[1]),
        backgroundColor: [
          "#6366F1",
          "#3B82F6",
          "#22C55E",
          "#F59E0B",
          "#8B5CF6",
        ],
        borderWidth: 0,
      },
    ],
  };
  const ageOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12, font: { size: 10 } },
      },
    },
  };

  const genderEntries = Object.entries(genderDistribution);
  const genderData = {
    labels: genderEntries.map((g) => capitalize(g[0])),
    datasets: [
      {
        data: genderEntries.map((g) => g[1]),
        backgroundColor: ["#6366F1", "#EC4899", "#6B7280"],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
  const genderOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 12, font: { size: 10 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.label}: ${ctx.parsed} (${percent(
              ctx.parsed,
              genderEntries
            )})`,
        },
      },
    },
  };

  const metrics = [
    {
      label: "Attendee Age",
      value: topAge ? `${topAge[0]} (${topAge[1]})` : "—",
      icon: (
        <UserCircle2
          size={18}
          className="text-blue-600"
        />
      ),
      color: "text-blue-600",
    },
    {
      label: "Attendee Gender",
      value: topGender ? `${capitalize(topGender[0])} (${topGender[1]})` : "—",
      icon: (
        <Users
          size={18}
          className="text-purple-600"
        />
      ),
      color: "text-purple-600",
    },
    {
      label: "Attendee Location",
      value: topLocation ? `${topLocation[0]} (${topLocation[1]})` : "—",
      icon: (
        <MapPin
          size={18}
          className="text-green-600"
        />
      ),
      color: "text-green-600",
    },
    {
      label: "Attendee Interests",
      value: topInterest ? `${topInterest[0]} (${topInterest[1]})` : "—",
      icon: (
        <Star
          size={18}
          className="text-yellow-600"
        />
      ),
      color: "text-yellow-600",
    },
    {
      label: "Total Attendees",
      value: totalAttendees,
      icon: (
        <BarChart3
          size={18}
          className="text-red-600"
        />
      ),
      color: "text-red-600",
    },
  ];

  const cardBase = "bg-white rounded-2xl p-5 shadow-sm border flex flex-col";

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            All Attendee Insights
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-md">
            Overview of attendee demographics & engagement to guide marketing,
            personalization and capacity planning.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="text-xs px-3 py-1.5 border bg-white hover:bg-gray-50 rounded-md shadow-sm"
        >
          Refresh Data
        </button>
      </header>

      {error && (
        <div className="text-sm bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      {/* Metrics */}
      <section className="grid gap-4 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => (
          <Metric
            key={m.label}
            label={m.label}
            value={m.value}
            icon={m.icon}
            color={m.color}
          />
        ))}
      </section>

      {/* Charts */}
      <section className="grid gap-6 xl:grid-cols-12">
        {/* Locations - wide */}
        <div className={`${cardBase} xl:col-span-7 relative overflow-hidden`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">
              Attendee Locations (Top 8)
            </h2>
            <span className="text-[10px] text-gray-400">
              {locEntries.length} regions
            </span>
          </div>
          <div className="h-72">
            {locEntries.length ? (
              <Bar
                data={locationsData}
                options={locationsOptions}
              />
            ) : (
              <Placeholder>No location data</Placeholder>
            )}
          </div>
        </div>

        {/* Right column pies */}
        <div className="xl:col-span-5 space-y-6">
          <div className={`${cardBase} relative overflow-hidden`}>
            <h2 className="font-semibold mb-3 text-sm">Attendee Interests</h2>
            <div className="h-64 flex items-center justify-center">
              {interestEntries.length ? (
                <Pie
                  data={interestsData}
                  options={interestsOptions}
                />
              ) : (
                <Placeholder>No interest data</Placeholder>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className={`${cardBase} relative overflow-hidden`}>
              <h2 className="font-semibold mb-3 text-sm">Attendee Ages</h2>
              <div className="h-56 flex items-center justify-center">
                {ageEntries.length ? (
                  <Pie
                    data={ageData}
                    options={ageOptions}
                  />
                ) : (
                  <Placeholder>No age data</Placeholder>
                )}
              </div>
            </div>
            <div className={`${cardBase} relative overflow-hidden`}>
              <h2 className="font-semibold mb-3 text-sm">Attendee Gender</h2>
              <div className="h-56 flex items-center justify-center">
                {genderEntries.length ? (
                  <Pie
                    data={genderData}
                    options={genderOptions}
                  />
                ) : (
                  <Placeholder>No gender data</Placeholder>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Placeholder({ children }) {
  return (
    <div className="text-xs text-gray-400 flex items-center h-full">
      {children}
    </div>
  );
}

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function percent(value, entries) {
  const total = entries.reduce((s, e) => s + e[1], 0) || 1;
  return ((value / total) * 100).toFixed(1) + "%";
}
