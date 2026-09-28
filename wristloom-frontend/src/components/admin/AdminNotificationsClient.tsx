'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  Wrench,
  AlertTriangle,
  Info,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/primitives/Button';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string | Date;
  link?: string;
}

export function AdminNotificationsClient({
  initialNotifications,
}: {
  initialNotifications: NotificationItem[];
}) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');
  const [isMarking, setIsMarking] = React.useState(false);

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    setIsMarking(true);
    try {
      await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    } finally {
      setIsMarking(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PENDING_ORDER':
      case 'NEW_ORDER':
        return <ShoppingBag className="w-4 h-4 text-[#B08D57]" />;
      case 'PENDING_BOOKING':
      case 'SERVICE_COMPLETED':
        return <Wrench className="w-4 h-4 text-emerald-400" />;
      case 'LOW_STOCK':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-[#B08D57]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
            System Telemetry
          </span>
          <h1 className="font-display text-2xl sm:text-3xl text-[#EDE6D6]">Administrative Notifications</h1>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button onClick={markAllRead} variant="subtle" size="sm" loading={isMarking}>
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              <span>Mark all as read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[rgba(176,141,87,0.10)] pb-2 text-xs font-mono">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`pb-1 uppercase tracking-wider transition-colors ${
              filter === 'all'
                ? 'border-b-2 border-[#B08D57] text-[#B08D57] font-semibold'
                : 'text-[rgba(237,230,214,0.40)] hover:text-[#EDE6D6]'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`pb-1 uppercase tracking-wider transition-colors ${
              filter === 'unread'
                ? 'border-b-2 border-[#B08D57] text-[#B08D57] font-semibold'
                : 'text-[rgba(237,230,214,0.40)] hover:text-[#EDE6D6]'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] py-16 text-center text-xs font-mono text-[rgba(237,230,214,0.40)]">
            No notifications to display in this view.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-[2px] border transition-all flex items-start justify-between gap-4 ${
                !n.read
                  ? 'bg-[#1E1A17] border-[rgba(176,141,87,0.30)] shadow-md'
                  : 'bg-[#14110F] border-[rgba(176,141,87,0.10)] opacity-75'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-[2px] bg-[#14110F] border border-[rgba(176,141,87,0.20)] flex-shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#EDE6D6]">{n.title}</p>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57]" />
                    )}
                  </div>
                  <p className="text-xs text-[rgba(237,230,214,0.65)] mt-1 leading-relaxed">{n.body}</p>
                  <span className="font-mono text-[10px] text-[rgba(237,230,214,0.40)] mt-2 block">
                    {new Date(n.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {n.link && (
                <Link
                  href={n.link}
                  className="px-3 py-1.5 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] rounded-[2px] text-xs font-mono uppercase tracking-wider text-[rgba(237,230,214,0.80)] hover:text-[#EDE6D6] flex items-center gap-1 flex-shrink-0 transition-colors"
                >
                  <span>Action</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#B08D57]" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
