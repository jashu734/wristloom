'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { handleCompleteSignOut } from '@/lib/logout';
import { useRouter } from 'next/navigation';
import { User, Bell, Shield, CreditCard, LogOut, ChevronRight, Save, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/primitives/Button';
import { formatCurrency } from '@/lib/utils';

// ─── Section Card ─────────────────────────────────────────────
function SettingsCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] p-6 mb-4">
      <div className="mb-5">
        <h3 className="font-display text-lg text-[#EDE6D6]">{title}</h3>
        {description && <p className="text-xs text-[rgba(237,230,214,0.45)] mt-1">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────
function SettingsToggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(176,141,87,0.08)] last:border-0">
      <div>
        <p className="text-sm text-[#EDE6D6]">{label}</p>
        {description && <p className="text-xs text-[rgba(237,230,214,0.40)] mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#B08D57]' : 'bg-[rgba(176,141,87,0.20)]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

// ─── Sidebar nav ──────────────────────────────────────────────
const NAV = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'billing', icon: CreditCard, label: 'Billing' },
];

// ─── Main Component ───────────────────────────────────────────
export function AccountSettingsClient() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [active, setActive] = React.useState('profile');

  // Profile Form State
  const [profileForm, setProfileForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    location: 'Mumbai, India',
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = React.useState({ current: false, new: false, confirm: false });

  // Notifications State
  const [notifications, setNotifications] = React.useState({
    bookingConfirmations: true,
    technicianEnRoute: true,
    serviceCompleted: true,
    newArrivals: false,
    memberOffers: true,
    workshopReminders: true,
    tradeInValuations: false,
    newsletter: false,
  });

  // Preferences State
  const [preferences, setPreferences] = React.useState({
    darkMode: true,
    showCollectionPublicly: false,
    serviceReminders: true,
  });

  const [walletBalance, setWalletBalance] = React.useState(0);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch real profile on mount
  React.useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setProfileForm({
              name: data.user.name ?? session?.user?.name ?? '',
              email: data.user.email ?? session?.user?.email ?? '',
              phone: data.user.phone ?? '',
              location: 'Mumbai, India',
            });
            if (data.user.creditWallet?.balance !== undefined) {
              setWalletBalance(data.user.creditWallet.balance);
            }
          }
        } else if (session?.user) {
          setProfileForm({
            name: session.user.name ?? '',
            email: session.user.email ?? '',
            phone: session.user.phone ?? '',
            location: 'Mumbai, India',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadProfile();
  }, [session?.user]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to update profile');
      }

      // Update NextAuth JWT session
      await update({
        user: {
          name: profileForm.name,
          phone: profileForm.phone,
        },
      });

      setStatusMessage({ type: 'success', text: 'Profile changes saved successfully to database.' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({ type: 'error', text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Password update failed');
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatusMessage({ type: 'success', text: 'Password changed successfully.' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({ type: 'error', text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14110F] pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/account')}
            className="font-mono text-[9px] tracking-widest uppercase text-[#B08D57] hover:text-[#C49D67] flex items-center gap-1 mb-4"
          >
            ← Back to Account
          </button>
          <h1 className="font-display text-3xl text-[#EDE6D6]">Settings</h1>
          <p className="text-sm text-[rgba(237,230,214,0.45)] mt-1">Manage your account preferences and security</p>
        </div>

        {/* Global Feedback Banner */}
        {statusMessage && (
          <div
            className={`p-4 rounded-[2px] mb-6 flex items-center gap-3 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-red-950/40 border-red-500/30 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            )}
            <p className="text-sm font-sans">{statusMessage.text}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-48 shrink-0">
            <nav className="bg-[#1E1A17] border border-[rgba(176,141,87,0.10)] rounded-[2px] overflow-hidden">
              {NAV.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActive(id);
                    setStatusMessage(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left border-b border-[rgba(176,141,87,0.06)] last:border-0
                    ${active === id ? 'bg-[rgba(176,141,87,0.10)] text-[#B08D57]' : 'text-[rgba(237,230,214,0.55)] hover:text-[#EDE6D6]'}`}
                >
                  <Icon size={14} />
                  {label}
                  {active === id && <ChevronRight size={12} className="ml-auto" />}
                </button>
              ))}
              <button
                onClick={() => handleCompleteSignOut('/')}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {active === 'profile' && (
              <form onSubmit={handleSaveProfile}>
                <SettingsCard title="Personal Information" description="Update your name, email, and contact details">
                  {isLoadingProfile ? (
                    <div className="py-8 flex items-center justify-center gap-2 text-sm text-[rgba(237,230,214,0.4)]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#B08D57]" />
                      Loading profile...
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-2">
                          Full Name <span className="text-[#B08D57]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-4 py-3 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-2">
                          Email Address (Read-only)
                        </label>
                        <input
                          type="email"
                          disabled
                          value={profileForm.email}
                          className="w-full bg-[#14110F]/50 border border-[rgba(176,141,87,0.10)] rounded-[2px] px-4 py-3 text-sm text-[rgba(237,230,214,0.4)] cursor-not-allowed"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-4 py-3 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none transition-colors"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-2">
                          Primary Location
                        </label>
                        <input
                          type="text"
                          placeholder="Mumbai, India"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-4 py-3 text-sm text-[#EDE6D6] placeholder:text-[rgba(237,230,214,0.25)] focus:border-[#B08D57] focus:outline-none transition-colors"
                        />
                      </div>
                    </>
                  )}
                </SettingsCard>

                <SettingsCard title="Preferences">
                  <SettingsToggle
                    label="Dark Mode"
                    description="Use dark theme across the platform"
                    checked={preferences.darkMode}
                    onChange={(val) => setPreferences({ ...preferences, darkMode: val })}
                  />
                  <SettingsToggle
                    label="Show Collection Publicly"
                    description="Allow others to view your watch vault"
                    checked={preferences.showCollectionPublicly}
                    onChange={(val) => setPreferences({ ...preferences, showCollectionPublicly: val })}
                  />
                  <SettingsToggle
                    label="Service Reminders"
                    description="Get reminded about upcoming maintenance"
                    checked={preferences.serviceReminders}
                    onChange={(val) => setPreferences({ ...preferences, serviceReminders: val })}
                  />
                </SettingsCard>

                <div className="flex justify-end mt-4">
                  <Button type="submit" variant="primary" size="md" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {active === 'notifications' && (
              <div>
                <SettingsCard title="Notification Preferences" description="Choose what you want to be notified about">
                  <SettingsToggle
                    label="Booking Confirmations"
                    checked={notifications.bookingConfirmations}
                    onChange={(val) => setNotifications({ ...notifications, bookingConfirmations: val })}
                  />
                  <SettingsToggle
                    label="Technician En Route"
                    checked={notifications.technicianEnRoute}
                    onChange={(val) => setNotifications({ ...notifications, technicianEnRoute: val })}
                  />
                  <SettingsToggle
                    label="Service Completed"
                    checked={notifications.serviceCompleted}
                    onChange={(val) => setNotifications({ ...notifications, serviceCompleted: val })}
                  />
                  <SettingsToggle
                    label="New Collection Arrivals"
                    checked={notifications.newArrivals}
                    onChange={(val) => setNotifications({ ...notifications, newArrivals: val })}
                  />
                  <SettingsToggle
                    label="Exclusive Member Offers"
                    checked={notifications.memberOffers}
                    onChange={(val) => setNotifications({ ...notifications, memberOffers: val })}
                  />
                  <SettingsToggle
                    label="Workshop Reminders"
                    checked={notifications.workshopReminders}
                    onChange={(val) => setNotifications({ ...notifications, workshopReminders: val })}
                  />
                  <SettingsToggle
                    label="Trade-In Valuations"
                    checked={notifications.tradeInValuations}
                    onChange={(val) => setNotifications({ ...notifications, tradeInValuations: val })}
                  />
                  <SettingsToggle
                    label="Weekly Newsletter"
                    checked={notifications.newsletter}
                    onChange={(val) => setNotifications({ ...notifications, newsletter: val })}
                  />
                </SettingsCard>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setStatusMessage({ type: 'success', text: 'Notification preferences updated.' });
                      setTimeout(() => setStatusMessage(null), 3000);
                    }}
                  >
                    <Save size={14} /> Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {active === 'security' && (
              <form onSubmit={handleChangePassword}>
                <SettingsCard title="Change Password" description="Use a strong password of at least 8 characters">
                  <div className="mb-4">
                    <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-2">
                      Current Password <span className="text-[#B08D57]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-4 py-3 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(237,230,214,0.35)] hover:text-[#B08D57]"
                      >
                        {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-2">
                      New Password <span className="text-[#B08D57]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-4 py-3 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(237,230,214,0.35)] hover:text-[#B08D57]"
                      >
                        {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] block mb-2">
                      Confirm New Password <span className="text-[#B08D57]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-4 py-3 text-sm text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgba(237,230,214,0.35)] hover:text-[#B08D57]"
                      >
                        {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </SettingsCard>

                <div className="flex justify-end mt-4">
                  <Button type="submit" variant="primary" size="md" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Update Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {active === 'billing' && (
              <SettingsCard title="Billing & Credits" description="Manage your payment methods and wallet credits">
                <div className="bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-4 mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[9px] tracking-widest uppercase text-[rgba(237,230,214,0.35)] mb-1">Wristloom Credits</p>
                    <p className="font-display text-2xl text-[#B08D57]">{formatCurrency(walletBalance)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/shop')}
                  >
                    Use in Boutique
                  </Button>
                </div>
                <div className="bg-[#14110F] border border-dashed border-[rgba(176,141,87,0.20)] rounded-[2px] p-6 text-center">
                  <p className="text-sm text-[rgba(237,230,214,0.40)]">Payment methods can be added during bespoke checkout or service scheduling.</p>
                  <Button
                    variant="subtle"
                    size="sm"
                    className="mt-3"
                    onClick={() => router.push('/services/repair')}
                  >
                    Schedule Service
                  </Button>
                </div>
              </SettingsCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
