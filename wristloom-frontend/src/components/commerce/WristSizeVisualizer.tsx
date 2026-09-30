'use client';

import * as React from 'react';
import { Ruler, Sparkles, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface WristSizeVisualizerProps {
  watchName: string;
  brand: string;
  caseSize: string; // e.g. "41mm"
  caseThickness?: string; // e.g. "12mm"
}

export function WristSizeVisualizer({
  watchName,
  brand,
  caseSize,
  caseThickness = '12mm',
}: WristSizeVisualizerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [wristCircumference, setWristCircumference] = React.useState(6.75); // inches

  // Parse numeric diameter (default 40mm)
  const diameter = parseInt(caseSize.replace(/[^0-9]/g, ''), 10) || 40;
  // Estimated lug-to-lug distance (typically diameter + 7mm)
  const lugToLug = diameter + 7;

  // Approximate flat top wrist width based on circumference (in mm)
  // Anatomical flat top width ≈ (Circumference in mm / π) * 1.32 (elliptical ratio)
  const wristCircumferenceMm = wristCircumference * 25.4;
  const flatWristWidthMm = Math.round((wristCircumferenceMm / Math.PI) * 1.3);

  // Clearance calculation
  const totalClearance = flatWristWidthMm - lugToLug;
  const sideClearance = Math.round(totalClearance / 2);

  // Fit classification
  let fitStatus: 'ideal' | 'bold' | 'overhang' = 'ideal';
  let fitTitle = 'Exquisite Atelier Proportion';
  let fitDescription =
    'The lugs rest comfortably within your wrist borders with ample clearance, ensuring maximum ergonomics under dress cuffs.';

  if (sideClearance < 2 && sideClearance >= -2) {
    fitStatus = 'bold';
    fitTitle = 'Commanding Contemporary Presence';
    fitDescription =
      'The lugs span edge-to-edge across the flat plane of your wrist for an assertive, high-presence aesthetic.';
  } else if (sideClearance < -2) {
    fitStatus = 'overhang';
    fitTitle = 'Lug Overhang Advisory';
    fitDescription =
      'The lug tips slightly exceed your wrist span. We recommend inspecting with a curved leather strap rather than a rigid end-link bracelet.';
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="font-mono text-xs px-3 py-1.5 rounded-[2px] border border-[rgba(176,141,87,0.25)] text-[#B08D57] hover:border-[#B08D57] hover:bg-[rgba(176,141,87,0.08)] transition-colors flex items-center gap-1.5 cursor-pointer"
      >
        <Ruler className="w-3.5 h-3.5 text-[#B08D57]" />
        <span>Simulate Wrist Fit ({caseSize})</span>
      </button>

      {/* Modal Visualizer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1A1614] border border-[rgba(176,141,87,0.3)] rounded-[2px] w-full max-w-lg overflow-hidden shadow-2xl">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(176,141,87,0.15)] bg-[#1E1A17]">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#B08D57]" />
                <span className="font-display text-base text-[#EDE6D6]">
                  Horological Wrist Proportion Simulator
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[rgba(237,230,214,0.4)] hover:text-[#EDE6D6] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
              
              {/* Watch Profile Overview */}
              <div className="bg-[#14110F] border border-[rgba(176,141,87,0.15)] rounded p-3.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(237,230,214,0.4)] block">
                    {brand} Timepiece
                  </span>
                  <span className="font-display font-medium text-[#EDE6D6]">{watchName}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(237,230,214,0.4)] block">
                    Dimensions
                  </span>
                  <span className="font-mono font-medium text-[#B08D57]">
                    Ø {diameter}mm · L-to-L {lugToLug}mm
                  </span>
                </div>
              </div>

              {/* Wrist Size Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="font-mono text-xs tracking-wider uppercase text-[rgba(237,230,214,0.7)]">
                    Your Wrist Circumference:
                  </label>
                  <span className="font-mono text-base text-[#B08D57] font-semibold">
                    {wristCircumference.toFixed(2)}&quot; ({Math.round(wristCircumference * 2.54 * 10) / 10} cm)
                  </span>
                </div>
                <input
                  type="range"
                  min={5.75}
                  max={8.5}
                  step={0.125}
                  value={wristCircumference}
                  onChange={(e) => setWristCircumference(parseFloat(e.target.value))}
                  className="w-full accent-[#B08D57] cursor-pointer"
                />
                
                {/* Benchmark Pills */}
                <div className="flex justify-between text-[10px] font-mono text-[rgba(237,230,214,0.35)] pt-1">
                  <span>6.0&quot; (Slender)</span>
                  <span>6.75&quot; (Classic)</span>
                  <span>7.25&quot; (Average)</span>
                  <span>8.0&quot; (Broad)</span>
                </div>
              </div>

              {/* Visual Wrist Silhouette Scale Diagram */}
              <div className="bg-[#14110F] border border-[rgba(176,141,87,0.2)] rounded p-6 text-center relative overflow-hidden">
                <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(237,230,214,0.4)] block mb-4">
                  Top-Down Anatomic Wrist Scale (Flat Plane: {flatWristWidthMm}mm)
                </span>

                {/* Wrist Width Contour Bar */}
                <div className="relative mx-auto h-28 bg-[#1E1A17] border border-[rgba(176,141,87,0.25)] rounded-2xl flex items-center justify-center p-2 max-w-sm">
                  {/* Subtle skin / wrist gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(176,141,87,0.03)] via-[rgba(176,141,87,0.08)] to-[rgba(176,141,87,0.03)] rounded-2xl pointer-events-none" />

                  {/* Watch Silhouette overlay scaled relative to wrist */}
                  <div
                    style={{
                      width: `${Math.min(95, Math.round((lugToLug / flatWristWidthMm) * 85))}%`,
                    }}
                    className="relative z-10 flex flex-col items-center justify-center transition-all duration-300"
                  >
                    {/* Upper Lug */}
                    <div className="w-1/2 h-3.5 bg-[#B08D57]/30 border-t-2 border-x-2 border-[#B08D57] rounded-t-sm" />

                    {/* Circular Watch Bezel */}
                    <div className="w-20 h-20 rounded-full border-2 border-[#B08D57] bg-[#14110F] flex flex-col items-center justify-center shadow-lg shadow-black/80">
                      <span className="font-mono text-[9px] text-[#B08D57] font-semibold">{diameter}mm</span>
                      <span className="font-mono text-[7px] text-[rgba(237,230,214,0.4)]">{brand}</span>
                    </div>

                    {/* Lower Lug */}
                    <div className="w-1/2 h-3.5 bg-[#B08D57]/30 border-b-2 border-x-2 border-[#B08D57] rounded-b-sm" />
                  </div>

                  {/* Left Clearance indicator */}
                  <div className="absolute left-2 text-[9px] font-mono text-[rgba(237,230,214,0.35)]">
                    {sideClearance > 0 ? `+${sideClearance}mm` : `${sideClearance}mm`}
                  </div>
                  {/* Right Clearance indicator */}
                  <div className="absolute right-2 text-[9px] font-mono text-[rgba(237,230,214,0.35)]">
                    {sideClearance > 0 ? `+${sideClearance}mm` : `${sideClearance}mm`}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-[rgba(237,230,214,0.5)] mt-3 max-w-sm mx-auto">
                  <span>Lug-to-Lug: <strong className="text-[#EDE6D6]">{lugToLug}mm</strong></span>
                  <span>Wrist Plane: <strong className="text-[#EDE6D6]">{flatWristWidthMm}mm</strong></span>
                </div>
              </div>

              {/* Fit Result Diagnostic Box */}
              <div
                className={`p-4 rounded border text-left flex gap-3 ${
                  fitStatus === 'ideal'
                    ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                    : fitStatus === 'bold'
                    ? 'border-[#B08D57]/40 bg-[rgba(176,141,87,0.08)] text-[#EDE6D6]'
                    : 'border-amber-500/40 bg-amber-950/20 text-amber-200'
                }`}
              >
                {fitStatus === 'ideal' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : fitStatus === 'bold' ? (
                  <Sparkles className="w-5 h-5 text-[#B08D57] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-display text-sm font-medium mb-0.5">{fitTitle}</h4>
                  <p className="text-xs text-[rgba(237,230,214,0.65)] leading-relaxed">
                    {fitDescription}
                  </p>
                </div>
              </div>

              {/* Horologist Advice */}
              <div className="text-[11px] text-[rgba(237,230,214,0.45)] space-y-1">
                <p>• <strong>Case Thickness:</strong> At {caseThickness}, this timepiece slips effortlessly under tailored cuffs.</p>
                <p>• <strong>Custom Strap Sizing:</strong> Complimentary bracelet link sizing & bespoke leather strap trimming included with every order.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 rounded bg-[#B08D57] hover:bg-[#C5A059] text-[#0E0C0A] font-medium text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
