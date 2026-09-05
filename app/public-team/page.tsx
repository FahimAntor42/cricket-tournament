import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

// Forces Next.js to evaluate this page dynamically at runtime instead of static pre-rendering
export const dynamic = 'force-dynamic';

interface Team {
  id: string;
  team_name: string;
  captain_name: string;
  status: string;
  created_at?: string;
}

export default async function PublicTeamPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  let teams: Team[] = [];
  let fetchError: string | null = null;

  if (supabaseUrl && supabaseServiceKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      fetchError = error.message;
    } else {
      teams = data || [];
    }
  } else {
    fetchError = 'Supabase configuration environment variables are missing.';
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-400">
              Registered Teams
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Orient Blast Cricket Carnival Roster
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg transition-colors"
          >
            Register New Team
          </Link>
        </div>

        {/* Error Banner */}
        {fetchError && (
          <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-sm">
            Unable to load roster: {fetchError}
          </div>
        )}

        {/* Teams List */}
        {teams.length === 0 && !fetchError ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-400">No teams registered yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg text-white">
                    {team.team_name}
                  </h2>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase ${
                      team.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : team.status === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {team.status || 'pending'}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Captain: <span className="text-slate-200">{team.captain_name || 'N/A'}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}