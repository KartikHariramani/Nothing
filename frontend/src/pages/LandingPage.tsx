import React, { useState, useEffect } from 'react';
import { Campaign } from '../types';
import { campaignService } from '../services/api';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { RegistrationModal } from '../components/campaigns/RegistrationModal';
import { 
  Heart, Sparkles, ArrowRight, CheckCircle2, Users, Calendar, 
  ShieldCheck, QrCode, Zap, Bell, Activity, ChevronRight, ChevronLeft, TrendingUp, Droplet, Smartphone, Clock
} from 'lucide-react';

const heroImages = [
  '/images/WhatsApp Image 2026-09-11 at 4.23.51 PM.jpeg',
  '/images/WhatsApp Image 2026-09-16 at 8.13.17 AM (1).jpeg',
  '/images/WhatsApp Image 2026-09-16 at 8.13.17 AM.jpeg',
];

interface LandingPageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedCampaign: (c: Campaign) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentTab, setSelectedCampaign }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedRegCamp, setSelectedRegCamp] = useState<Campaign | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => setCurrentImageIdx((prev) => (prev + 1) % heroImages.length);
  const prevImage = () => setCurrentImageIdx((prev) => (prev - 1 + heroImages.length) % heroImages.length);

  useEffect(() => {
    campaignService.getPublicCampaigns()
      .then(data => setCampaigns(data))
      .catch(err => console.error(err));
  }, []);

  const totalCampaigns = campaigns.length;
  const totalSlots = campaigns.reduce((acc, c) => acc + c.target_count, 0);

  return (
    <div className="space-y-24 pb-24 bg-background">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-50 via-white to-white opacity-70"></div>
        
        {/* Blood Drop Animation Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          <div className="relative w-full h-[400px] flex justify-center">
            {/* The Droplet */}
            <div className="absolute top-0 animate-drop-fall z-10 text-brand-600">
              <svg width="40" height="56" viewBox="0 0 40 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 0C20 0 0 25.5 0 36C0 47.0457 8.95431 56 20 56C31.0457 56 40 47.0457 40 36C40 25.5 20 0 20 0Z" />
              </svg>
            </div>
            
            {/* The Ripple Surface */}
            <div className="absolute bottom-[100px] w-full flex justify-center items-center">
              <div className="relative w-64 h-16">
                <div className="absolute inset-0 border-brand-500 rounded-[100%] animate-ripple-expand mx-auto"></div>
                <div className="absolute inset-0 border-brand-400 rounded-[100%] animate-ripple-expand mx-auto" style={{ animationDelay: '0.4s' }}></div>
                <div className="absolute inset-0 border-brand-300 rounded-[100%] animate-ripple-expand mx-auto" style={{ animationDelay: '0.8s' }}></div>
                {/* Surface Reflection */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-white/20 backdrop-blur-[1px] rounded-[100%] shadow-[0_0_20px_rgba(215,25,32,0.1)]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12 mt-16">
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-600 text-sm font-semibold tracking-wide border border-brand-100 shadow-sm animate-fade-in">
              <Droplet className="w-4 h-4" />
              <span>EVERY DROP COUNTS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-navy-900 tracking-tight leading-[1.1] animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Be the reason <br/> someone <span className="text-brand-600">lives.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-slide-up" style={{ animationDelay: '0.3s' }}>
              Life Share connects donors, organizers, and volunteers to make blood donation simple, reliable, and profoundly impactful.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={() => setCurrentTab('campaigns')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-[0_8px_20px_-6px_rgba(215,25,32,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_25px_-6px_rgba(215,25,32,0.6)] flex items-center justify-center gap-2"
              >
                <span>Find a Campaign</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentTab('how-it-works')}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-navy-900 border border-slate-200 font-bold hover:bg-slate-50 transition-all hover:-translate-y-1"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Hero Autoplay Slideshow */}
          <div className="lg:w-1/3 w-full animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="relative w-full aspect-[3/4] sm:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/40 bg-slate-900 group">
              {heroImages.map((src, idx) => (
                <img
                  key={src}
                  src={src}
                  alt={`Blood Donation Drive ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ease-in-out ${
                    idx === currentImageIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                />
              ))}
              
              {/* Controls */}
              <div className="absolute inset-0 z-20 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={prevImage} className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-navy-900 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all focus:outline-none">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={nextImage} className="w-10 h-10 rounded-full bg-white/80 hover:bg-white text-navy-900 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all focus:outline-none">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Indicators */}
              <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all shadow-[0_2px_4px_rgba(0,0,0,0.4)] focus:outline-none ${
                      idx === currentImageIdx ? 'bg-brand-500 scale-125' : 'bg-white/70 hover:bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE STATISTICS CARD */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            <div className="text-center px-4">
              {totalCampaigns > 0 ? (
                <>
                  <p className="text-4xl font-extrabold text-navy-900 mb-2">{totalCampaigns}</p>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Campaigns</p>
                </>
              ) : (
                <p className="text-sm text-slate-400 my-4">No campaign data yet</p>
              )}
            </div>
            <div className="text-center px-4">
              {totalSlots > 0 ? (
                <>
                  <p className="text-4xl font-extrabold text-brand-600 mb-2">{totalSlots}</p>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Available Slots</p>
                </>
              ) : (
                <p className="text-sm text-slate-400 my-4">No data available yet</p>
              )}
            </div>
            <div className="text-center px-4">
              <p className="text-4xl font-extrabold text-navy-900 mb-2">100%</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Commitment</p>
            </div>
            <div className="text-center px-4">
              <p className="text-4xl font-extrabold text-success mb-2">Live</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Waitlist System</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CAMPAIGN DISCOVERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900">Find a Campaign Near You</h2>
            <p className="text-slate-500 mt-3 text-lg">Join a drive and make a direct impact in your community.</p>
          </div>
          <button 
            onClick={() => setCurrentTab('campaigns')}
            className="text-brand-600 font-bold flex items-center gap-2 hover:text-brand-700 transition-colors mt-4 sm:mt-0"
          >
            View All Campaigns <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm text-slate-500">
              <Droplet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No campaigns are currently available.</p>
              <p className="text-sm">Check back later or register as an organizer.</p>
            </div>
          ) : (
            campaigns.slice(0, 3).map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onSelect={(c) => {
                  setSelectedCampaign(c);
                  setCurrentTab('campaign_detail');
                }}
                onQuickRegister={(c) => setSelectedRegCamp(c)}
              />
            ))
          )}
        </div>
      </section>

      {/* 4. HOW LIFE SHARE WORKS */}
      <section className="bg-slate-50 py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900">How Life Share Works</h2>
            <p className="text-slate-500 mt-4 text-lg">A seamless journey from intention to impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-brand-100 via-brand-300 to-brand-100 -translate-y-1/2 z-0"></div>

            {[
              { num: '01', title: 'Discover', desc: 'Find local blood drives easily.', icon: Heart },
              { num: '02', title: 'Register', desc: 'Book a convenient time slot.', icon: Calendar },
              { num: '03', title: 'Stay Connected', desc: 'Get smart Telegram reminders.', icon: Bell },
              { num: '04', title: 'Show Up', desc: 'Scan your QR and save lives.', icon: QrCode },
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border border-slate-50 mb-6 group hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                  <step.icon className="w-8 h-8 text-brand-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-brand-600 font-bold text-sm mb-2">{step.num}</div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTELLIGENCE & WAITLIST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900 text-white rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-12 lg:p-16 flex flex-col justify-center">
              <span className="text-brand-400 font-bold tracking-wider uppercase text-sm mb-4 block">Smart Mobilisation</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 leading-tight">
                From Intention to Attendance.
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                Life Share uses attendance prediction, smart reminders, and dynamic waitlist optimization to help organizers turn donor registrations into real attendance.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Attendance Prediction</h4>
                    <p className="text-slate-400 text-sm mt-1">Machine learning evaluates historical data to project accurate turnout probabilities.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Zap className="w-6 h-6 text-brand-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Dynamic Waitlist</h4>
                    <p className="text-slate-400 text-sm mt-1">Cancellations instantly promote the best eligible donor from the queue automatically.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-navy-800 p-8 lg:p-16 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-center">
              <div className="bg-navy-950 rounded-2xl p-6 border border-white/5 shadow-inner">
                <p className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">Dynamic Queue Visualization</p>
                
                <div className="space-y-4 relative before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-white/10">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-error"></div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl flex-1 opacity-50">
                      <p className="text-xs text-slate-400">Confirmed Slot</p>
                      <p className="text-sm font-bold line-through text-slate-300">Cancellation Detected</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-warning" />
                    </div>
                    <div className="bg-warning/10 p-3 rounded-xl flex-1 border border-warning/20">
                      <p className="text-xs text-warning">AI Ranking Triggered</p>
                      <p className="text-sm font-bold text-white">Evaluating Waitlist...</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl flex-1 border border-white/10 transform transition-all translate-x-2">
                      <p className="text-xs text-success">Best Eligible Donor</p>
                      <p className="text-sm font-bold text-white">PROMOTED & NOTIFIED</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TELEGRAM & QR EXPERIENCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Telegram Card */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-lg text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-3">Seamless Notifications</h3>
            <p className="text-slate-500 mb-8 max-w-sm">Receive smart reminders and instant waitlist promotions directly on Telegram.</p>
            
            <div className="bg-slate-50 rounded-2xl p-4 w-full max-w-xs text-left border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <p className="text-xs font-bold text-blue-600 mb-1">Life Share</p>
              <p className="text-sm text-slate-800 font-medium mb-3">Your donation campaign is tomorrow.</p>
              <div className="text-xs text-slate-500 space-y-1 mb-4">
                <p>🩸 Campaign: Community Drive</p>
                <p>📍 Venue: GCOEN Campus</p>
                <p>🕐 Time: 10:30 AM</p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 py-1.5 bg-blue-100 text-blue-700 text-xs text-center font-bold rounded-lg cursor-pointer">Confirm</div>
                <div className="flex-1 py-1.5 bg-slate-200 text-slate-700 text-xs text-center font-bold rounded-lg cursor-pointer">Cancel</div>
              </div>
            </div>
          </div>

          {/* QR Card */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-lg text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-navy-900 mb-3">Fast Check-in</h3>
            <p className="text-slate-500 mb-8 max-w-sm">Show your unique QR code at the venue for instant, verified attendance tracking.</p>
            
            <div className="bg-slate-50 rounded-2xl p-6 w-full max-w-xs text-center border border-slate-200 shadow-sm">
              <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-4">
                <QrCode className="w-full h-full text-slate-800" />
              </div>
              <p className="text-sm font-bold text-navy-900">Scan to Check In</p>
              <div className="inline-flex items-center gap-1 mt-2 text-success text-xs font-bold px-2 py-1 bg-success/10 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Verified Pass
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. IMPACT & CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-brand-600 text-white rounded-[3rem] overflow-hidden px-6 py-20 text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-brand-600 to-brand-600 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <Droplet className="w-12 h-12 text-white/50 mx-auto mb-6" />
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-6">
              Your Drop Creates a Ripple.
            </h2>
            <p className="text-brand-100 text-lg sm:text-xl leading-relaxed mb-10">
              One registration can become one appointment. One appointment can become one donation. And one donation can help save lives.
            </p>
            <button
              onClick={() => setCurrentTab('campaigns')}
              className="px-10 py-5 rounded-full bg-white text-brand-600 font-extrabold text-lg hover:bg-brand-50 hover:scale-105 transition-all shadow-xl"
            >
              Become a Donor
            </button>
          </div>
        </div>
      </section>

      {/* Registration Modal Popup */}
      {selectedRegCamp && (
        <RegistrationModal
          campaign={selectedRegCamp}
          onClose={() => setSelectedRegCamp(null)}
          onSuccess={(reg) => {
            setSelectedRegCamp(null);
            setCurrentTab('donor');
          }}
        />
      )}
    </div>
  );
};
