import { useEffect, useRef, useState } from "react";
import EventCard from "@/components/EventCard";
import EventFormModal from "@/components/EventFormModal";
import { API_BASE_URL } from "@/config/api";
import { PageLoading } from "@/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("date");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const abortRef = useRef(null);
  const mountedRef = useRef(false);
  const filterTimeoutRef = useRef(null);
  const DEBOUNCE_MS = 400;

  const fetchEvents = async ({
    page: p = page,
    search: s = search,
    status: st = status,
    minPrice: minP = minPrice,
    maxPrice: maxP = maxPrice,
    fromDate: fromD = fromDate,
    toDate: toD = toDate,
    sort: so = sort,
  } = {}) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const isFirst = !mountedRef.current || initialLoading;
    if (isFirst) setInitialLoading(true);
    else setFetching(true);
    try {
      if (!isFirst) setError("");
      const params = new URLSearchParams({ page: p, limit: 12 });
      if (s.trim()) params.append("search", s.trim());
      if (st) params.append("status", st);
      if (minP) params.append("minPrice", minP);
      if (maxP) params.append("maxPrice", maxP);
      if (fromD) params.append("fromDate", fromD);
      if (toD) params.append("toDate", toD);
      if (so && so !== "date") params.append("sort", so);
      const res = await fetch(`${API_BASE_URL}/events?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setEvents(data.data || []);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
    } catch (e) {
      if (e.name === "AbortError") return;
      setError(e.message);
    } finally {
      if (isFirst) setInitialLoading(false);
      else setFetching(false);
      mountedRef.current = true;
    }
  };

  const applyFilters = () => {
    if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);

    filterTimeoutRef.current = setTimeout(() => {
      fetchEvents({ page: 1 });
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    const handle = setTimeout(() => {
      fetchEvents({ page: 1, search });
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    if (!mountedRef.current) return;

    applyFilters();
  }, [status, minPrice, maxPrice, fromDate, toDate, sort]);

  const handleSearchChange = (e) => setSearch(e.target.value);

  const goPage = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    fetchEvents({ page: p });
  };

  if (initialLoading) return <PageLoading text="Loading events..." />;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-xs text-gray-500 mt-1">Browse and search events</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          {user && user.role === "admin" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Create Event
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1 text-sm rounded-md border hover:bg-gray-50 whitespace-nowrap"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={handleSearchChange}
              className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fetching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 animate-pulse">
                updating
              </span>
            )}
          </div>
        </div>
      </div>
      {showFilters && (
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">Min Price</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">Max Price</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="date">Date Asc</option>
              <option value="-date">Date Desc</option>
              <option value="price">Price Asc</option>
              <option value="-price">Price Desc</option>
              <option value="createdAt">Created Asc</option>
              <option value="-createdAt">Created Desc</option>
            </select>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
      {events && events.length === 0 ? (
        <div className="text-gray-500 text-sm">No events found.</div>
      ) : (
        <div className="gap-[35px] flex flex-wrap mx-auto">
          {events.map((ev) => (
            <EventCard
              key={ev.id || ev._id}
              event={ev}
              onDelete={(deletedId) => {
                setEvents(events.filter((e) => (e.id || e._id) !== deletedId));
              }}
            />
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 mt-8 flex-wrap">
          <button
            onClick={() => goPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm rounded-md border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-sm font-medium">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => goPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm rounded-md border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
      <EventFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        event={null}
        onSuccess={(newEvent) => {
          setEvents([newEvent, ...events]);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}
