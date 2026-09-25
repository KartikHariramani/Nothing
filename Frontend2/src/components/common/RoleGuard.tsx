import React from 'react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { ShieldAlert, Lock, ArrowRight, UserCheck, RefreshCw } from 'lucide-react';

interface RoleGuardProps {
  requiredRole: Role;
  roleTitle: string;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, roleTitle, children }) => {
  const { isAuthenticated, currentUser, navigateTo, switchRole, logout, loginWithGoogle } = useApp();

  // 1. Not Authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <div className="bg-surface-white rounded-3xl border border-neutral-200 shadow-modal p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-red-50 text-brand-red-600 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
              Access Gate
            </span>
            <h2 className="font-headline font-bold text-2xl text-trust-blue-700">
              Authentication Required
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto">
              The <strong>{roleTitle}</strong> requires authenticated credentials under Section 65B BNSS statutory protocols. Please sign in or register to proceed.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {/* Google Quick Button */}
            <button
              onClick={() => loginWithGoogle(requiredRole)}
              className="w-full py-3 px-4 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl font-headline font-semibold text-xs text-neutral-800 shadow-sm transition flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google as {roleTitle}</span>
            </button>

            <button
              onClick={() => navigateTo('/login')}
              className="w-full py-2.5 bg-primary hover:bg-brand-red-600 text-white rounded-xl font-headline font-semibold text-xs transition shadow-sm"
            >
              Sign In / Register with Email & Password
            </button>

            <button
              onClick={() => navigateTo('/')}
              className="w-full py-2 text-neutral-500 hover:text-neutral-800 text-xs font-semibold"
            >
              Return to Public Discovery
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated but Role mismatch
  if (currentUser.role !== requiredRole) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <div className="bg-surface-white rounded-3xl border border-neutral-200 shadow-modal p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Role Demarcation Gate
            </span>
            <h2 className="font-headline font-bold text-2xl text-trust-blue-700">
              Access Restricted
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto">
              This workspace is strictly reserved for <strong>{roleTitle}</strong> personnel. You are currently authenticated as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}).
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => switchRole(requiredRole)}
              className="w-full py-2.5 bg-trust-blue-700 hover:bg-trust-blue-500 text-white rounded-xl font-headline font-semibold text-xs transition shadow-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch Perspective to {roleTitle}</span>
            </button>

            <button
              onClick={() => logout()}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-headline font-semibold text-xs transition"
            >
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated and Role matches!
  return <>{children}</>;
};
