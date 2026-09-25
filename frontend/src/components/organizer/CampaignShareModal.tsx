import React, { useRef, useState } from 'react';
import { Campaign } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Download, Share2, MessageCircle } from 'lucide-react';

interface Props {
  campaign: Campaign;
  onClose: () => void;
}

export const CampaignShareModal: React.FC<Props> = ({ campaign, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(`🩸 Blood Donation Drive
Every drop counts. Join our upcoming blood donation campaign at ${campaign.venue}.
📅 Date: ${campaign.drive_date}
📍 Venue: ${campaign.venue}
🔗 Register here: ${window.location.origin}/register-campaign/${campaign.id}`);

  const registrationUrl = `${window.location.origin}/register-campaign/${campaign.id}`;
  const qrRef = useRef<SVGSVGElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrRef.current) return;
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `campaign_qr_${campaign.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Blood Donation Drive',
          text: message,
          url: registrationUrl,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      handleCopy();
    }
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(registrationUrl)}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-emerald-600 mb-2">Campaign Created Successfully!</h2>
          <p className="text-slate-500 text-sm">Share your blood donation drive to start gathering registrations.</p>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <QRCodeSVG 
            value={registrationUrl} 
            size={180} 
            level="H"
            includeMargin={true}
            ref={qrRef}
            className="rounded-xl shadow-sm"
          />
          <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-widest">Public Registration QR</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Customize Share Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleCopy} className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700">
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button onClick={handleDownloadQR} className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-700">
            <Download className="w-4 h-4" />
            Download QR
          </button>
          <button onClick={handleTelegramShare} className="flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-sm font-bold">
            <MessageCircle className="w-4 h-4" />
            Telegram
          </button>
          <button onClick={handleShare} className="flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-sm">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <button onClick={onClose} className="w-full py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors">
          Done
        </button>
      </div>
    </div>
  );
};
