'use client';

// Forces runtime evaluation to prevent build-time static generation checks on auth routes
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password, // Retain exact password without trimming spaces
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data?.session) {
        // Refresh router cache and push to dashboard cleanly
        router.refresh();
        router.push('/admin/dashboard');
      } else {
        setErrorMsg('Session could not be established. Please try again.');
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error('Login Exception:', err);
      const message = err instanceof Error ? err.message : 'Connection failed.';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 mb-2">
            <ShieldCheck className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-xs text-slate-400">THE ORIENT BLAST — Sign in to manage tournament data</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@orientblast.com"
                className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white outline-none focus:border-yellow-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white outline-none focus:border-yellow-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
