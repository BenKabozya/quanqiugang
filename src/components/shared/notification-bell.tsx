"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell({ dark = false }: { dark?: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setNotifications(data);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    load();
  }

  async function handleClick(n: Notification) {
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
      load();
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative w-9 h-9 flex items-center justify-center rounded-lg border transition ${
          dark
            ? "border-line text-white/60 hover:text-white"
            : "border-line text-white/60 hover:text-white"
        }`}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-teal text-slate-bg text-[10px] font-bold rounded-full w-4.5 h-4.5 min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-panel border border-line rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-line">
            <p className="text-white text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-teal text-xs font-medium hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-white/30 text-xs p-4 text-center">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => handleClick(n)}
                  className={`block p-3 border-b border-line last:border-0 hover:bg-field transition ${
                    !n.read ? "bg-teal/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold">{n.title}</p>
                      {n.body && (
                        <p className="text-white/50 text-xs mt-0.5 truncate">{n.body}</p>
                      )}
                      <p className="text-white/25 text-[10px] mt-1">
                        {new Date(n.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}