import React, { useState, useEffect } from 'react';
import { Attendance, Campaign } from '../../types';
import { attendanceService } from '../../services/api';
import { Camera, CheckCircle2, XCircle, AlertTriangle, History } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  campaign: Campaign;
}

export const QRScannerTab: React.FC<Props> = ({ campaign }) => {
  const [manualToken, setManualToken] = useState('');
  const [recentAttendances, setRecentAttendances] = useState<Attendance[]>([]);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = React.useRef<Html5Qrcode | null>(null);

  const fetchAttendances = async () => {
    try {
      const atts = await attendanceService.getCampaignAttendance(campaign.id);
      setRecentAttendances(atts);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAttendances();
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [campaign.id]);

  const startScanner = async () => {
    try {
      setScannerActive(true);
      setScanResult(null);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("org-qr-reader");
      }
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScanner();
          setManualToken(decodedText);
          handleVerifyToken(decodedText);
        },
        (error) => {}
      );
    } catch (e) {
      console.error(e);
      setScannerActive(false);
      setScanResult({
        valid: false,
        status: 'error',
        message: 'Camera access is required to scan donor QR codes.'
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
      const res = await attendanceService.checkInQR(token.trim(), campaign.id);
      setScanResult(res);

      if (res.valid) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        setManualToken('');
        fetchAttendances();
      }
    } catch (e: any) {
      setScanResult({
        valid: false,
        status: 'error',
        message: e.response?.data?.detail || e.response?.data?.message || 'Network validation failed.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Scanner Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Camera className="w-4 h-4 text-brand-600" />
          <span>Organizer Check-In Scanner</span>
        </h2>
        
        {!scannerActive ? (
          <button
            type="button"
            onClick={startScanner}
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            <span>Start Scanner</span>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-brand-500">
              <div id="org-qr-reader" className="w-full"></div>
            </div>
            <button
              type="button"
              onClick={stopScanner}
              className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
            >
              Cancel Scanner
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-xs font-bold text-slate-400">OR</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleVerifyToken(); }} className="space-y-3">
          <input
            type="text"
            required
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Scan or enter LS-QR-..."
            className="w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={loading || !manualToken.trim()}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl"
          >
            {loading ? 'Verifying...' : 'Validate QR'}
          </button>
        </form>

        {scanResult && (
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
            scanResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
            scanResult.status === 'already_used' ? 'bg-amber-50 border-amber-200 text-amber-900' :
            'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2 font-black text-sm">
              {scanResult.valid ? <><CheckCircle2 className="w-5 h-5" />✓ Confirmed</> :
               scanResult.status === 'already_used' ? <><AlertTriangle className="w-5 h-5" />⚠️ Already Used</> :
               <><XCircle className="w-5 h-5" />✕ Rejected</>}
            </div>
            <p className="font-semibold">{scanResult.message}</p>
          </div>
        )}
      </div>

      {/* Log Box */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-brand-600" />
          <span>Recent Check-ins ({recentAttendances.length})</span>
        </h3>
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {recentAttendances.map(att => (
            <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold">{att.donor_name}</p>
                <p className="text-[10px] text-slate-400">{att.slot_time}</p>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 rounded">
                {new Date(att.checked_in_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
