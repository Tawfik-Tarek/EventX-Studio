import { useEffect, useRef, useState } from "react";
import EventCard from "@/components/EventCard";
import { API_BASE_URL } from "@/config/api";
import { PageLoading } from "@/components/LoadingSpinner";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); 
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const abortRef = useRef(null);
  const mountedRef = useRef(false);
  const DEBOUNCE_MS = 400;

  const fetchEvents = async ({ page: p = page, search: s = search } = {}) => {
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
          <p className="text-xs text-gray-500 mt-1">
            Browse and search upcoming events
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={handleSearchChange}
              className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            {fetching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 animate-pulse">
                updating
              </span>
            )}
          </div>
        </div>
      </div>
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {error}
        </div>
      )}
      {events.length === 0 ? (
        <div className="text-gray-500 text-sm">No events found.</div>
      ) : (
        <div className="gap-[35px] flex flex-wrap">
          {events.map((ev) => (
            <EventCard
              key={ev.id || ev._id}
              event={ev}
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
    </div>
  );
}
