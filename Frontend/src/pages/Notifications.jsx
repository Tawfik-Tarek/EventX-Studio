import { useNotifications } from "@/contexts/NotificationContext";
import { useEffect } from "react";

export default function NotificationsPage() {
  const {
    notifications,
    unread,
    loading,
    error,
    fetchMore,
    markRead,
    markAllRead,
    refreshNotifications,
    hasMorePages,
  } = useNotifications();

  useEffect(() => {
    document.title = `Notifications (${unread})`;
  }, [unread]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="text-xs text-gray-500">Recent updates & activity</p>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={refreshNotifications}
            className="px-3 py-1 border rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={markAllRead}
            className="px-3 py-1 border rounded-md hover:bg-gray-50"
          >
            Mark all read
          </button>
        </div>
      </div>
      {error && (
        <div className="text-xs bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded">
          {error}
        </div>
      )}
      <ul className="bg-white rounded-lg border divide-y max-h-[70vh] overflow-y-auto">
        {notifications.map((n) => (
          <li
            key={n._id}
            className={`p-3 text-sm flex items-start gap-3 ${
              n.isRead ? "opacity-70" : ""
            }`}
          >
            <div
              className={`w-2 h-2 mt-2 rounded-full ${
                n.isRead ? "bg-gray-300" : "bg-green-500"
              }`}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800">{n.title}</p>
              <p className="text-gray-600 text-xs mt-0.5">{n.message}</p>
              <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-2">
                <span>{new Date(n.createdAt).toLocaleString()}</span>
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n._id)}
                    className="underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
        {!notifications.length && !loading && (
          <li className="p-4 text-xs text-gray-500">No notifications</li>
        )}
        {loading && (
          <li className="p-4 text-xs text-gray-500 animate-pulse">
            Loading...
          </li>
        )}
      </ul>
      <div className="text-center">
        <button
          onClick={fetchMore}
          disabled={!hasMorePages() || loading}
          className={`text-xs underline ${
            !hasMorePages() || loading
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-600 hover:text-black"
          }`}
        >
          {loading
            ? "Loading..."
            : hasMorePages()
            ? "Load more"
            : "No more notifications"}
        </button>
      </div>
    </div>
  );
}
