"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface AdminNotification {
  id: number;
  type: "new_order" | "new_inquiry" | "new_review" | "payment_failed";
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface AdminNotificationsSummary {
  unreadCount: number;
  recent: AdminNotification[];
  badges: {
    orders: number;
    inventory: number;
    inquiries: number;
    reviews: number;
  };
}

interface AdminNotificationsContextValue extends AdminNotificationsSummary {
  markRead: (id: number) => void;
  markAllRead: () => void;
  refresh: () => void;
}

const EMPTY_SUMMARY: AdminNotificationsSummary = {
  unreadCount: 0,
  recent: [],
  badges: { orders: 0, inventory: 0, inquiries: 0, reviews: 0 },
};

const AdminNotificationsContext = createContext<AdminNotificationsContextValue>({
  ...EMPTY_SUMMARY,
  markRead: () => {},
  markAllRead: () => {},
  refresh: () => {},
});

const POLL_INTERVAL_MS = 18000;

export function AdminNotificationsProvider({ children }: { children: React.ReactNode }) {
  const [summary, setSummary] = useState<AdminNotificationsSummary>(EMPTY_SUMMARY);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications/summary");
      if (!res.ok) return;
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  const markRead = useCallback(
    (id: number) => {
      setSummary((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
        recent: prev.recent.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      }));
      fetch("/api/admin/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).then(fetchSummary);
    },
    [fetchSummary]
  );

  const markAllRead = useCallback(() => {
    setSummary((prev) => ({
      ...prev,
      unreadCount: 0,
      recent: prev.recent.map((n) => ({ ...n, isRead: true })),
    }));
    fetch("/api/admin/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).then(fetchSummary);
  }, [fetchSummary]);

  return (
    <AdminNotificationsContext.Provider value={{ ...summary, markRead, markAllRead, refresh: fetchSummary }}>
      {children}
    </AdminNotificationsContext.Provider>
  );
}

export function useAdminNotifications() {
  return useContext(AdminNotificationsContext);
}
