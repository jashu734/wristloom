'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { handleCompleteSignOut } from '@/lib/logout';
import {
  LayoutDashboard,
  Watch,
  ShoppingBag,
  Users,
  Wrench,
  ClipboardCheck,
  CalendarClock,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  User,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

interface AdminLayoutShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, exact: true },
  { label: 'Products', href: '/admin/products', icon: Watch },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Technicians', href: '/admin/technicians', icon: Wrench },
  { label: 'Service Bookings', href: '/admin/service-bookings', icon: ClipboardCheck },
  { label: 'Appointments', href: '/admin/bookings', icon: CalendarClock },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminLayoutShell({ children, user }: AdminLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [unreadCount, setUnreadCount] = React.useState(0);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread notifications count
  React.useEffect(() => {
    fetch('/api/admin/notifications')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href || pathname === '/admin';
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-[#14110F] text-[#EDE6D6] flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#1E1A17] border-r border-[rgba(176,141,87,0.15)] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-[rgba(176,141,87,0.10)] flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <span className="font-display text-xl tracking-tight text-[#EDE6D6]">Wristloom</span>
              <span className="font-mono text-[9px] tracking-widest uppercase bg-[rgba(176,141,87,0.15)] text-[#B08D57] px-2 py-0.5 rounded-[1px] border border-[rgba(176,141,87,0.30)]">
                Admin
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[rgba(237,230,214,0.50)] hover:text-[#EDE6D6]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-[2px] text-xs font-mono tracking-wider uppercase transition-colors ${
                    active
                      ? 'bg-[#B08D57] text-[#14110F] font-semibold shadow-sm shadow-[#B08D57]/20'
                      : 'text-[rgba(237,230,214,0.65)] hover:text-[#EDE6D6] hover:bg-[rgba(176,141,87,0.06)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        active ? 'bg-[#14110F] text-[#B08D57]' : 'bg-[#B08D57] text-[#14110F]'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[rgba(176,141,87,0.10)] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-[11px] font-mono tracking-wider uppercase text-[rgba(237,230,214,0.40)] hover:text-[#B08D57] transition-colors"
          >
            <span>Live Boutique</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={() => handleCompleteSignOut('/login')}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-mono tracking-wider uppercase text-red-400 hover:bg-red-950/20 rounded-[2px] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-[#1E1A17] border-b border-[rgba(176,141,87,0.10)] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <form onSubmit={handleGlobalSearch} className="relative w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgba(176,141,87,0.40)]" />
              <input
                type="text"
                placeholder="Search catalog, orders, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] pl-9 pr-4 py-1.5 text-xs text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.30)] focus:border-[#B08D57] focus:outline-none transition-colors"
              />
            </form>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Notifications Shortcut */}
            <Link
              href="/admin/notifications"
              className="relative p-2 text-[rgba(237,230,214,0.60)] hover:text-[#EDE6D6] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#B08D57] rounded-full animate-pulse" />
              )}
            </Link>

            {/* Admin Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 bg-[#14110F] border border-[rgba(176,141,87,0.20)] hover:border-[#B08D57] rounded-[2px] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#B08D57] text-[#14110F] flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-medium text-[#EDE6D6] leading-none">Wristloom Admin</p>
                  <p className="text-[10px] font-mono text-[rgba(237,230,214,0.45)] leading-tight mt-0.5">
                    wristloom@gmail.com
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[rgba(176,141,87,0.60)]" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#1E1A17] border border-[rgba(176,141,87,0.20)] rounded-[2px] shadow-2xl z-50 py-1.5">
                  <div className="px-4 py-2.5 border-b border-[rgba(176,141,87,0.10)]">
                    <p className="text-xs font-semibold text-[#EDE6D6]">Wristloom Administrator</p>
                    <p className="text-[10px] font-mono text-[rgba(237,230,214,0.40)] truncate">wristloom@gmail.com</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-[#B08D57]" />
                      <span className="text-[9px] font-mono uppercase tracking-widest text-[#B08D57]">Role: ADMIN</span>
                    </div>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/admin/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[rgba(237,230,214,0.70)] hover:text-[#EDE6D6] hover:bg-[rgba(176,141,87,0.06)] transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-[rgba(237,230,214,0.70)] hover:text-[#EDE6D6] hover:bg-[rgba(176,141,87,0.06)] transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Platform Settings</span>
                    </Link>
                    <button
                      onClick={() => handleCompleteSignOut('/login')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-950/20 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Child Pages Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
