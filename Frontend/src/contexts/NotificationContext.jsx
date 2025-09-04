import { createContext, useContext, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within provider");
  return ctx;
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [sseConnected, setSseConnected] = useState(false);
  const esRef = useRef(null);
  const pageRef = useRef(1);
  const pollIntervalRef = useRef(null);

  const { user, loading: authLoading } = useAuth();

  const token = user ? localStorage.getItem("token") : null;

  const fetchUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUnread(data.unread || 0);
      }
    } catch (e) {
      console.warn("Failed to fetch unread count:", e);
    }
  };

  const fetchPage = async (page = 1) => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/notifications?page=${page}&limit=30`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        const newNotifications = data.data || [];
        console.log(
          `Fetched page ${page}, got ${newNotifications.length} notifications, total: ${data.total}`
        );
        if (page === 1) {
          setNotifications(newNotifications);
          setTotalNotifications(data.total || 0);
        } else {
          setNotifications((prev) => [...prev, ...newNotifications]);
        }
        pageRef.current = page;
        // Only fetch unread count on first page to avoid unnecessary calls
        if (page === 1) {
          fetchUnreadCount();
        }
      } else {
        setError(data.message || "Failed to fetch notifications");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const connectStream = () => {
    if (!token || esRef.current) return;
    const url = `${API_BASE_URL.replace(/\/$/, "")}/notifications/stream`;
    const es = new EventSource(url, {
      withCredentials: false,
      headers: { Authorization: `Bearer ${token}` },
    });

    esRef.current = es;
    es.addEventListener("notification", (evt) => {
      try {
        const n = JSON.parse(evt.data);
        setNotifications((prev) => [n, ...prev]);
        fetchUnreadCount();
      } catch {}
    });
    es.onerror = () => {
      // try reconnect after delay
      es.close();
      esRef.current = null;
      setTimeout(connectStream, 5000);
    };
  };

  const connectStreamWithQuery = () => {
    if (!token || esRef.current) return;
    const url = `${API_BASE_URL.replace(
      /\/$/,
      ""
    )}/notifications/stream?token=${token}`;
    console.log("Connecting to EventSource:", url);
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("open", () => {
      console.log("EventSource connected successfully");
      setSseConnected(true);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    });

    es.addEventListener("notification", (evt) => {
      console.log("Received notification event:", evt.data);
      try {
        const n = JSON.parse(evt.data);
        console.log("Parsed notification:", n);
        // Add the notification to the top of the list
        setNotifications((prev) => [{ ...n, isRead: false }, ...prev]);
        // Update unread count
        setUnread((prev) => prev + 1);
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    });

    es.addEventListener("error", (error) => {
      console.error("EventSource error:", error);
      console.error("EventSource readyState:", es.readyState);
      setSseConnected(false);
      es.close();
      esRef.current = null;
      // Start polling as fallback
      startPolling();
      // Try to reconnect after delay
      setTimeout(connectStreamWithQuery, 5000);
    });

    es.addEventListener("message", (evt) => {
      console.log("Received generic message:", evt.data);
    });
  };

  const markRead = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        // Decrement unread count if this notification was unread
        setUnread((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.warn("Failed to mark notification as read:", e);
    }
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/mark-all/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnread(0);
      }
    } catch (e) {
      console.warn("Failed to mark all notifications as read:", e);
    }
  };

  const startPolling = () => {
    if (pollIntervalRef.current) return; // Already polling
    console.log("Starting notification polling as SSE fallback");
    pollIntervalRef.current = setInterval(async () => {
      if (!token) return;
      try {
        // Check for new notifications by comparing current count with server
        const res = await fetch(`${API_BASE_URL}/notifications/unread`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.unread > unread) {
          // There are new notifications, refresh the list
          console.log("New notifications detected via polling, refreshing...");
          await fetchPage(1);
        }
      } catch (e) {
        console.warn("Polling failed:", e);
      }
    }, 30000); // Poll every 30 seconds
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const refreshNotifications = async () => {
    await fetchPage(1);
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchPage(1);
      // Try query param variant (backend must accept it)
      connectStreamWithQuery();
      // Start polling as backup after 10 seconds if SSE hasn't connected
      setTimeout(() => {
        if (!sseConnected) {
          startPolling();
        }
      }, 10000);
    }
    return () => {
      if (esRef.current) esRef.current.close();
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Separate effect to fetch unread count after user is loaded
  useEffect(() => {
    if (!authLoading && user && token) {
      fetchUnreadCount();
    }
  }, [user, authLoading, token]);

  const hasMorePages = () => {
    return notifications.length < totalNotifications;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unread,
        loading,
        error,
        fetchMore: () => fetchPage(pageRef.current + 1),
        markRead,
        markAllRead,
        refreshNotifications,
        hasMorePages,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
