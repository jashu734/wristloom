'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Bell, User, LogOut, Settings, Wrench, ShieldCheck, Loader2, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type: string;
}

export function HeaderAuth() {
  const { data: session, status } = useSession();
  const [showPanel, setShowPanel] = React.useState(false);
  const [showNotif, setShowNotif] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unread, setUnread] = React.useState(0);
  const notifRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Load notifications
  React.useEffect(() => {
    if (!session?.user) return;
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications ?? []);
        setUnread(d.unreadCount ?? 0);
      })
      .catch(() => {});
  }, [session?.user?.id]);

  // Close panels on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setShowPanel(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [] }) });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  if (status === 'loading') {
    return <Loader2 className="w-4 h-4 text-[rgba(237,230,214,0.30)] animate-spin" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.55)] hover:text-[#EDE6D6] transition-colors">
          Sign In
        </Link>
        <Link href="/register" className="font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 border border-[rgba(176,141,87,0.30)] text-[#B08D57] hover:bg-[rgba(176,141,87,0.08)] rounded-[2px] transition-colors">
          Join
        </Link>
      </div>
    );
  }

  const role = session.user.role;

  return (
    <div className="flex items-center gap-3">
      {/* Notification Bell */}
      <div className="relative" ref={notifRef}>
        <button
          id="notification-bell"
          onClick={() => setShowNotif((v) => !v)}
          className="relative p-1.5 text-[rgba(237,230,214,0.50)] hover:text-[#EDE6D6] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#6B2737] text-white font-mono text-[8px] flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {showNotif && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] shadow-2xl z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(176,141,87,0.08)]">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.40)]">Notifications</span>
              {unread > 0 && (
                <button onClick={markAllRead} className="font-mono text-[9px] text-[#B08D57] hover:underline uppercase tracking-widest">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-[rgba(237,230,214,0.35)] text-center py-6">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-3 border-b border-[rgba(176,141,87,0.05)] hover:bg-[rgba(176,141,87,0.04)] ${!n.read ? 'bg-[rgba(176,141,87,0.06)]' : ''}`}>
                    <p className="text-xs font-medium text-[#EDE6D6]">{n.title}</p>
                    <p className="text-xs text-[rgba(237,230,214,0.50)] mt-0.5 leading-relaxed">{n.body}</p>
                    {!n.read && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B08D57] mt-1" />}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="relative" ref={panelRef}>
        <button
          id="user-menu-button"
          onClick={() => setShowPanel((v) => !v)}
          className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.55)] hover:text-[#EDE6D6] transition-colors"
          aria-label="User menu"
        >
          <div className="w-7 h-7 rounded-full bg-[rgba(176,141,87,0.15)] border border-[rgba(176,141,87,0.25)] flex items-center justify-center">
            <span className="font-mono text-[10px] text-[#B08D57]">
              {session.user.name?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          </div>
        </button>

        {showPanel && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] shadow-2xl z-50 py-1">
            <div className="px-4 py-3 border-b border-[rgba(176,141,87,0.08)]">
              <p className="text-sm text-[#EDE6D6] truncate">{session.user.name}</p>
              <p className="font-mono text-[9px] text-[rgba(237,230,214,0.35)] truncate mt-0.5">{session.user.email}</p>
              <span className="font-mono text-[8px] tracking-widest uppercase text-[#B08D57]">{role}</span>
            </div>
            <div className="py-1">
              <MenuItem icon={<User className="w-3.5 h-3.5" />} label="My Account" href="/account" />
              {role === 'TECHNICIAN' && (
                <MenuItem icon={<Wrench className="w-3.5 h-3.5" />} label="Technician Portal" href="/technician" />
              )}
              {role === 'ADMIN' && (
                <MenuItem icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Admin Dashboard" href="/admin" />
              )}
              <MenuItem icon={<Settings className="w-3.5 h-3.5" />} label="Settings" href="/account/settings" />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-[rgba(237,230,214,0.04)] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 px-4 py-2 text-xs text-[rgba(237,230,214,0.65)] hover:text-[#EDE6D6] hover:bg-[rgba(237,230,214,0.04)] transition-colors">
      {icon}
      {label}
    </Link>
  );
}
