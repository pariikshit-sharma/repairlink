"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Wrench,
  HeartHandshake,
  ShieldCheck,
  Info,
  CheckCheck,
  ChevronRight,
} from "lucide-react";
import { useNotifications, AppNotification } from "@/context/notification-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSelect = (item: AppNotification) => {
    markAsRead(item.id);
    setOpen(false);
    router.push(item.href);
  };

  const renderIcon = (category: AppNotification["category"]) => {
    switch (category) {
      case "repair":
        return <Wrench className="w-4 h-4 text-primary shrink-0" />;
      case "loan":
        return <HeartHandshake className="w-4 h-4 text-emerald-700 shrink-0" />;
      case "moderation":
        return <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-secondary shrink-0" />;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm"
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="region"
          aria-label="Notification Centre"
          className="fixed sm:absolute right-4 sm:right-0 left-4 sm:left-auto top-16 sm:top-full sm:mt-2 w-auto sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-elevated z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-secondary">
                Notifications
              </span>
              {unreadCount > 0 && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3",
                    !item.isRead && "bg-primary/[0.03]"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mt-0.5 shrink-0">
                    {renderIcon(item.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-xs text-secondary leading-snug",
                          !item.isRead ? "font-bold" : "font-semibold"
                        )}
                      >
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span
                          className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0"
                          title="Unread"
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {item.timestamp}
                      </span>
                      <span className="text-[10px] font-bold text-primary inline-flex items-center gap-0.5">
                        Open <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                You are completely caught up on repairs and mobility updates.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
