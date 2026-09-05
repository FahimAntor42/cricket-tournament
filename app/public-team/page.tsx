'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, Trophy, Search, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

interface Player {
  id: string;
  player_number: number;
  player_name: string;
  role: string;
}

interface Team {
  id: string;
  team_name: string;
  institution_type: string;
  institution_name: string;
  batch_info: string;
  captain_name: string;
  players: Player[];
}

export default function PublicTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfirmedTeams = async () => {
      setLoading(true);
      // Query confirmed registrations along with nested players
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          team_name,
          institution_type,
          institution_name,
          batch_info,
          captain_name,
          players (
            id,
            player_number,
            player_name,
            role
          )
        `)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: true });

      if (!error && data) {
        const formatted = data.map((t) => ({
          ...t,
          players: (t.players as Player[]).sort((a, b) => a.player_number - b.player_number),
        }));
        setTeams(formatted as Team[]);
      }
      setLoading(false);
    };

    fetchConfirmedTeams();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedTeamId((prev) => (prev === id ? null : id));
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.institution_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.captain_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="inline-block bg-yellow-500/20 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-500/30">
            THE ORIENT BLAST CRICKET CARNIVAL
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Confirmed Squads</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Official list of teams and players verified for the tournament at Rangpur Stadium.
          </p>
        </div>

        {/* Tracker & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>Confirmed Teams: <strong className="text-yellow-400 text-sm">{teams.length}</strong> / 16</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search team or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 pl-9 pr-4 py-2 rounded-xl text-xs outline-none focus:border-yellow-500 text-white"
            />
          </div>
        </div>

        {/* Teams List */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs sm:text-sm">
            Loading confirmed teams...
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-700 text-slate-400 text-xs sm:text-sm">
            No confirmed teams match your search.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTeams.map((team) => {
              const isExpanded = expandedTeamId === team.id;
              return (
                <div
                  key={team.id}
                  className="bg-slate-800/70 border border-slate-700 rounded-2xl overflow-hidden transition"
                >
                  {/* Team Card Header */}
                  <div
                    onClick={() => toggleExpand(team.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800 transition gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-white">{team.team_name}</h2>
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> VERIFIED
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {team.institution_name} ({team.institution_type})
                        {team.batch_info && ` • ${team.batch_info}`}
                      </p>
                      <p className="text-xs text-yellow-400 font-medium">Captain: {team.captain_name}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline-block text-xs font-semibold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
                        {team.players?.length || 0} Squad Members
                      </span>
                      <button className="p-2 text-slate-400 hover:text-white rounded-lg">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Player Roster */}
                  {isExpanded && (
                    <div className="border-t border-slate-700 bg-slate-900/80 p-4 sm:p-5 space-y-3">
                      <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4" /> Official 16-Player Roster
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        {team.players.map((p) => (
                          <div
                            key={p.id}
                            className="flex justify-between items-center bg-slate-800 p-2.5 rounded-xl border border-slate-700/60 text-xs"
                          >
                            <span className="font-semibold text-slate-200 truncate">
                              <strong className="text-slate-500 mr-1.5">#{p.player_number}</strong>
                              {p.player_name}
                            </span>
                            <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-yellow-400 border border-slate-800 shrink-0">
                              {p.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';

<Link
  href="/teams"
  className="text-xs font-semibold text-slate-300 hover:text-yellow-400 transition"
>
  Confirmed Teams
</Link>