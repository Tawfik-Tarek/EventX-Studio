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
  const esRef = useRef(null);
  const pageRef = useRef(1);

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
        setUnread(data.unread);
      }
    } catch (e) {
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
        if (page === 1) setNotifications(data.data);
        else setNotifications((prev) => [...prev, ...data.data]);
        pageRef.current = page;
        fetchUnreadCount();
      } else setError(data.message || "Failed to fetch notifications");
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

  // Because EventSource doesn't allow headers, we adapt by adding token in query
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
      console.log("EventSource connected");
    });

    es.addEventListener("notification", (evt) => {
      console.log("Received notification:", evt.data);
      try {
        const n = JSON.parse(evt.data);
        setNotifications((prev) => [n, ...prev]);
        fetchUnreadCount();
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    });

    es.addEventListener("error", (error) => {
      console.error("EventSource error:", error);
      es.close();
      esRef.current = null;
      setTimeout(connectStreamWithQuery, 5000);
    });

    es.addEventListener("message", (evt) => {
      console.log("Received message:", evt.data);
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
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        fetchUnreadCount();
      }
    } catch {}
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/mark-all/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        fetchUnreadCount();
      }
    } catch {}
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchPage(1);
      // Try query param variant (backend must accept it)
      connectStreamWithQuery();
    }
    return () => {
      if (esRef.current) esRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
