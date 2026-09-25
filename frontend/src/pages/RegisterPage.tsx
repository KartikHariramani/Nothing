import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService, getApiErrorMessage } from '../services/api';
import { Logo } from '../components/common/Logo';
import { UserPlus, AlertCircle, Droplet, Heart, Users } from 'lucide-react';

interface RegisterPageProps {
  setCurrentTab: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ setCurrentTab }) => {
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [role, setRole] = useState<'donor' | 'organizer'>('donor');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register({
        full_name: fullName,
        email: email.toLowerCase(),
        password: password,
        phone: phone,
        role: role,
      });
      localStorage.setItem('lifeshare_token', data.access_token);
      await login(email, password);
      setCurrentTab(role);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-brand-50 rounded-2xl flex items-center justify-center border border-brand-100">
          <UserPlus className="w-8 h-8 text-brand-600" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-navy-900">Join Life Share</h1>
          <p className="text-slate-500 mt-2">Create your account and start saving lives</p>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-lg space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">I want to register as</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`p-3 rounded-xl border text-center font-bold transition-all ${
                  role === 'donor'
                    ? 'bg-brand-900/30 border-brand-500 text-brand-400 ring-2 ring-brand-500/20'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="block text-sm">Blood Donor</span>
                <span className="text-[10px] text-slate-400 font-normal">Book slots & receive QR passes</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`p-3 rounded-xl border text-center font-bold transition-all ${
                  role === 'organizer'
                    ? 'bg-brand-900/30 border-brand-500 text-brand-400 ring-2 ring-brand-500/20'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="block text-sm">Drive Organizer</span>
                <span className="text-[10px] text-slate-400 font-normal">Host drives & manage turnouts</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aarav Patel"
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav@gmail.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98901 12345"
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-sm placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-[0_4px_14px_-3px_rgba(215,25,32,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Register Profile'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-sm text-slate-400">
          Already registered?{' '}
          <button
            onClick={() => setCurrentTab('login')}
            className="font-bold text-brand-600 hover:text-brand-700"
          >
            Sign in here
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
