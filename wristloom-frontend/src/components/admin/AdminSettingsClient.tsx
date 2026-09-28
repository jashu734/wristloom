'use client';

import * as React from 'react';
import { Button } from '@/components/primitives/Button';
import { Save, CheckCircle2, Shield, Bell, Globe, MapPin, Gauge } from 'lucide-react';

export function AdminSettingsClient() {
  const [settings, setSettings] = React.useState({
    currency: 'INR (₹)',
    serviceRadiusKm: '25',
    lowStockThreshold: '3',
    trackingBeaconIntervalSec: '10',
    automaticTechnicianAssignment: true,
    emailOrderConfirmations: true,
    maintenanceMode: false,
  });

  const [isSaving, setIsSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);

    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 600);
  };

  const inputClass =
    'w-full bg-[#14110F] border border-[rgba(176,141,87,0.20)] rounded-[2px] px-3.5 py-2 text-xs text-[#EDE6D6] focus:border-[#B08D57] focus:outline-none';
  const labelClass = 'block font-mono text-[10px] tracking-widest uppercase text-[rgba(237,230,214,0.45)] mb-1.5';

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(176,141,87,0.15)]">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#B08D57] block mb-1">
            Configuration
          </span>
          <h1 className="font-display text-2xl sm:text-3xl text-[#EDE6D6]">Platform Settings</h1>
        </div>
        <Button type="submit" variant="primary" size="md" loading={isSaving}>
          <Save className="w-4 h-4 mr-1.5" />
          <span>Save Configuration</span>
        </Button>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 rounded-[2px] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Atelier platform parameters saved successfully.</span>
        </div>
      )}

      {/* Operational Dispatch */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
          <MapPin className="w-4 h-4 text-[#B08D57]" />
          <h2 className="font-display text-base text-[#EDE6D6]">Atelier Dispatch & Logistics</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Default Horologist Radius (Kilometers)</label>
            <input
              type="number"
              value={settings.serviceRadiusKm}
              onChange={(e) => setSettings((p) => ({ ...p, serviceRadiusKm: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>GPS Radar Refresh Interval (Seconds)</label>
            <input
              type="number"
              value={settings.trackingBeaconIntervalSec}
              onChange={(e) => setSettings((p) => ({ ...p, trackingBeaconIntervalSec: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Inventory & Financials */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
          <Globe className="w-4 h-4 text-[#B08D57]" />
          <h2 className="font-display text-base text-[#EDE6D6]">Vault Inventory & Currency</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Base Platform Currency</label>
            <input
              disabled
              value={settings.currency}
              className="w-full bg-[#14110F]/50 border border-[rgba(176,141,87,0.10)] rounded-[2px] px-3.5 py-2 text-xs text-[rgba(237,230,214,0.60)] cursor-not-allowed"
            />
          </div>
          <div>
            <label className={labelClass}>Low Stock Alert Threshold (Units)</label>
            <input
              type="number"
              value={settings.lowStockThreshold}
              onChange={(e) => setSettings((p) => ({ ...p, lowStockThreshold: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Telemetry & Notifications */}
      <div className="bg-[#1E1A17] border border-[rgba(176,141,87,0.15)] rounded-[2px] p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-[rgba(176,141,87,0.10)]">
          <Bell className="w-4 h-4 text-[#B08D57]" />
          <h2 className="font-display text-base text-[#EDE6D6]">Automated Alerts</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#14110F] border border-[rgba(176,141,87,0.10)] rounded-[2px]">
            <div>
              <p className="text-xs font-medium text-[#EDE6D6]">Order Email Confirmations</p>
              <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
                Dispatch verified purchase certificates and tracking receipts via email
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailOrderConfirmations}
              onChange={(e) => setSettings((p) => ({ ...p, emailOrderConfirmations: e.target.checked }))}
              className="w-4 h-4 accent-[#B08D57]"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#14110F] border border-[rgba(176,141,87,0.10)] rounded-[2px]">
            <div>
              <p className="text-xs font-medium text-[#EDE6D6]">Maintenance Mode</p>
              <p className="font-mono text-[10px] text-[rgba(237,230,214,0.40)]">
                Restrict consumer checkout while allowing administrative inventory audits
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings((p) => ({ ...p, maintenanceMode: e.target.checked }))}
              className="w-4 h-4 accent-[#B08D57]"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
