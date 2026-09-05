'use client';

// Prevents Next.js from attempting static pre-rendering during build
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('teams').insert([
        {
          team_name: teamName,
          captain_name: captainName,
          captain_email: captainEmail,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Team registered successfully! Redirecting...' });
      setTeamName('');
      setCaptainName('');
      setCaptainEmail('');
      setTimeout(() => router.push('/public-team'), 1500);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">Register Your Team</h1>
          <p className="text-slate-400 text-sm mt-1">Orient Blast Cricket Carnival</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg text-sm border ${
              message.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-red-950/50 border-red-800 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Team Name</label>
            <input
              type="text"
              required
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="e.g. Orient Strikers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Captain Name</label>
            <input
              type="text"
              required
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Captain Email</label>
            <input
              type="email"
              required
              value={captainEmail}
              onChange={(e) => setCaptainEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="captain@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            {loading ? 'Submitting...' : 'Register Team'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <Link href="/public-team" className="text-sm text-slate-400 hover:text-emerald-400">
            &larr; View Registered Teams
          </Link>
        </div>
      </div>
    </div>
  );
}