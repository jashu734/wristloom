// ============================================================
// Wristloom — Global Route Loading Component
// Luxury horological escapement pulse animation
// ============================================================

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#14110F] flex flex-col items-center justify-center p-6 select-none">
      <div className="relative w-24 h-24 flex items-center justify-center mb-6">
        {/* Outer Tourbillon Cage Ring */}
        <div className="absolute inset-0 rounded-full border border-[rgba(176,141,87,0.25)] animate-[spin_8s_linear_infinite]" />
        
        {/* Inner Balance Wheel Ring */}
        <div className="absolute inset-2 rounded-full border border-dashed border-[#B08D57] animate-[spin_4s_linear_infinite_reverse]" />
        
        {/* Center Jewel Pivot */}
        <div className="w-3 h-3 rounded-full bg-[#B08D57] shadow-[0_0_15px_rgba(176,141,87,0.8)] animate-pulse" />
      </div>

      <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#B08D57] mb-1">
        Calibrating Atelier
      </p>
      <p className="text-xs text-[rgba(237,230,214,0.40)] font-sans">
        Regulating horological registry...
      </p>
    </div>
  );
}
