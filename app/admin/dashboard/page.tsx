'use client';

// Forces runtime evaluation to bypass build-time static generation checks
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Team {
  id: string;
  team_name: string;
  captain_name: string;
  captain_email: string;
  status: string;
  created_at?: string;
}

export default function AdminDashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Initial data fetch on component mount (no synchronous state calls)
  useEffect(() => {
    let isMounted = true;

    async function fetchInitialData() {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (error) {
          console.error('Failed to fetch teams:', error.message);
        } else {
          setTeams(data || []);
        }
      } catch (err: unknown) {
        if (isMounted) console.error('Unexpected error fetching teams:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Separate function for button refreshes & updates
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch teams:', error.message);
      } else {
        setTeams(data || []);
      }
    } catch (err: unknown) {
      console.error('Unexpected error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (team: Team, newStatus: 'approved' | 'rejected') => {
    setUpdatingId(team.id);

    try {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          status: newStatus,
          captainEmail: team.captain_email,
          teamName: team.team_name,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update status');
      }

      await handleRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Update failed';
      alert(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Manage Cricket Tournament Registrations</p>
          </div>
          <button
            onClick={() => void handleRefresh()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-medium rounded-lg transition-colors"
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading registrations...</div>
        ) : teams.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-400">
            No team registrations found.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Team Name</th>
                    <th className="px-6 py-4">Captain Name</th>
                    <th className="px-6 py-4">Captain Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {teams.map((team) => (
                    <tr key={team.id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-semibold text-white">{team.team_name}</td>
                      <td className="px-6 py-4">{team.captain_name || 'N/A'}</td>
                      <td className="px-6 py-4">{team.captain_email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                            team.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : team.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {team.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          disabled={updatingId === team.id || team.status === 'approved'}
                          onClick={() => void handleStatusUpdate(team, 'approved')}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 rounded-md transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          disabled={updatingId === team.id || team.status === 'rejected'}
                          onClick={() => void handleStatusUpdate(team, 'rejected')}
                          className="px-3 py-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-md transition-colors"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}