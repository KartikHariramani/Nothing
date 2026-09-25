import React, { useState, useEffect } from 'react';
import { Campaign, Attendance } from '../types';
import { campaignService, attendanceService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Camera, 
  Search, 
  History, 
  Sparkles,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';

export const VolunteerScannerPage: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [manualToken, setManualToken] = useState('');
  const [recentAttendances, setRecentAttendances] = useState<Attendance[]>([]);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = React.useRef<Html5Qrcode | null>(null);

  const fetchInitial = async () => {
    try {
      const data = await campaignService.getPublicCampaigns();
      setCampaigns(data);
      if (data.length > 0) {
        setSelectedCampaignId(data[0].id);
        fetchAttendances(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttendances = async (campId: string) => {
    try {
      const atts = await attendanceService.getCampaignAttendance(campId);
      setRecentAttendances(atts);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInitial();
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setScannerActive(true);
      setScanResult(null);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScanner();
          setManualToken(decodedText);
          handleVerifyToken(decodedText);
        },
        (error) => {
          // ignore frame errors
        }
      );
    } catch (e) {
      console.error(e);
      setScannerActive(false);
      setScanResult({
        valid: false,
        status: 'error',
        message: 'Camera access is required to scan donor QR codes. Please ensure you have granted camera permissions.'
      });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
    }
    setScannerActive(false);
  };

  const handleVerifyToken = async (tokenToVerify?: string) => {
    const token = tokenToVerify || manualToken;
    if (!token.trim()) return;

    setLoading(true);
    setScanResult(null);

    try {
      const res = await attendanceService.checkInQR(token.trim(), selectedCampaignId);
      setScanResult(res);

      if (res.valid) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        setManualToken('');
        if (selectedCampaignId) fetchAttendances(selectedCampaignId);
      }
    } catch (e: any) {
      setScanResult({
        valid: false,
        status: 'error',
        message: e.response?.data?.detail || 'Network validation failed.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700/60">
          <QrCode className="w-3 h-3" />
          <span>Volunteer Administrative Check-in</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Digital QR Pass Scanner
        </h1>
        <p className="text-xs text-slate-400">
          Fast, single-use administrative check-in verification at the blood drive venue.
        </p>
      </div>

      {/* Select Drive Window */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Active Drive Location
        </label>
        <select
          value={selectedCampaignId}
          onChange={(e) => {
            setSelectedCampaignId(e.target.value);
            fetchAttendances(e.target.value);
          }}
          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.venue})
            </option>
          ))}
        </select>
      </div>

      {/* Scanner & Manual Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Scan / Verify Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-brand-600" />
              <span>Verify Donor Pass (Live QR / Token)</span>
            </h2>
          </div>

          {!scannerActive ? (
            <button
              type="button"
              onClick={startScanner}
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              <span>Start Camera Scanner</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-brand-500 shadow-inner">
                <div id="qr-reader" className="w-full"></div>
              </div>
              <button
                type="button"
                onClick={stopScanner}
                className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Scanner</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-slate-200 flex-1"></div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerifyToken();
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Scan or Enter QR Token String
              </label>
              <input
                type="text"
                required
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="e.g. LS-QR-A1B2C3D4E5F6"
                className="w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !manualToken.trim()}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Validate & Confirm Attendance'}</span>
            </button>
          </form>

          {/* Validation Result Box */}
          {scanResult && (
            <div className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-in fade-in ${
              scanResult.valid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : scanResult.status === 'already_used'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2 font-black text-sm">
                {scanResult.valid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>✓ Attendance Confirmed</span>
                  </>
                ) : scanResult.status === 'already_used' ? (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span>⚠️ QR Already Used</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>✕ Invalid QR Token</span>
                  </>
                )}
              </div>

              <p className="font-semibold">{scanResult.message}</p>

              {scanResult.donor_name && (
                <div className="text-[11px] pt-1 border-t border-current/10 flex items-center justify-between">
                  <span>Donor: <strong>{scanResult.donor_name}</strong></span>
                  <span>Slot: {scanResult.slot_time}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Real-time Check-in Log at this Drive */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-600" />
              <span>Verified Check-ins at Venue ({recentAttendances.length})</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {recentAttendances.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No donors checked in yet today.
              </div>
            ) : (
              recentAttendances.map((att) => (
                <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{att.donor_name}</p>
                    <p className="text-[10px] text-slate-400">{att.slot_time}</p>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {new Date(att.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Non-medical volunteer guarantee banner */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <p>
          <strong>Non-Medical Administrative Verification:</strong> Volunteers verify physical arrival and redemption of digital check-in passes. No medical data is processed in this scanner.
        </p>
      </div>
    </div>
  );
};
