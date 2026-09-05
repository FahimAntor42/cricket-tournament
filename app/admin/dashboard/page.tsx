'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  ShieldCheck,
  RefreshCw,
  LogOut,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Search,
  Users,
  Clock,
  X,
  Phone,
  Mail,
  CreditCard,
  Building2,
  GraduationCap,
  Download,
  Loader2,
} from 'lucide-react';

interface Player {
  id: string;
  player_name: string;
  role: string;
  player_number: number;
}

interface Registration {
  id: string;
  team_name: string;
  institution_type: string;
  institution_name: string;
  batch_info: string;
  captain_name: string;
  phone: string;
  email: string;
  payment_method: string;
  amount: number;
  trx_id: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  confirmed_at: string | null;
  players: Player[];
}

export default function AdminRegistrationsPage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('all');
  const [selectedTeam, setSelectedTeam] = useState<Registration | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('registrations')
      .select('*, players(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRegistrations(data as Registration[]);
    } else if (error) {
      console.error('Error fetching registrations:', error.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkAuthAndLoad = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) router.push('/admin/login');
      } else {
        if (mounted) {
          setAuthChecking(false);
          fetchRegistrations();
        }
      }
    };

    checkAuthAndLoad();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/admin/login');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, fetchRegistrations]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTeam(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'confirmed' | 'rejected') => {
    setActionLoading(id);

    const targetTeam = registrations.find((item) => item.id === id);

    try {
      const response = await fetch('/api/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: id, // Fixed: Matched backend expectation
          status: newStatus,
          captainEmail: targetTeam?.email, // Fixed: Matched backend expectation
          teamName: targetTeam?.team_name || '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      const confirmed_at = newStatus === 'confirmed' ? new Date().toISOString() : null;

      setRegistrations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus, confirmed_at } : item
        )
      );

      if (selectedTeam?.id === id) {
        setSelectedTeam((prev) =>
          prev ? { ...prev, status: newStatus, confirmed_at } : null
        );
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      alert('Failed to update status: ' + errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team registration?')) return;

    setActionLoading(id);
    const { error } = await supabase.from('registrations').delete().eq('id', id);

    if (!error) {
      setRegistrations((prev) => prev.filter((item) => item.id !== id));
      if (selectedTeam?.id === id) setSelectedTeam(null);
    } else {
      alert('Failed to delete registration: ' + error.message);
    }
    setActionLoading(null);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      (reg.team_name || '').toLowerCase().includes(query) ||
      (reg.captain_name || '').toLowerCase().includes(query) ||
      (reg.phone || '').includes(query) ||
      (reg.trx_id || '').toLowerCase().includes(query) ||
      (reg.institution_name || '').toLowerCase().includes(query);

    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) return alert('No registrations to export.');

    const headers = ['Team Name', 'Institution', 'Type', 'Batch', 'Captain', 'Phone', 'Email', 'Payment Method', 'Amount', 'TrxID', 'Status', 'Submitted At'];
    const rows = filteredRegistrations.map((r) => [
      `"${(r.team_name || '').replace(/"/g, '""')}"`,
      `"${(r.institution_name || '').replace(/"/g, '""')}"`,
      `"${(r.institution_type || '').replace(/"/g, '""')}"`,
      `"${(r.batch_info || '').replace(/"/g, '""')}"`,
      `"${(r.captain_name || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.payment_method || '').replace(/"/g, '""')}"`,
      r.amount || 0,
      `"${(r.trx_id || '').replace(/"/g, '""')}"`,
      r.status,
      `"${r.created_at ? new Date(r.created_at).toLocaleString() : ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center font-sans gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        <p className="text-xs text-slate-400 animate-pulse">Verifying admin session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-3 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
              <span>Admin Registration Portal</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Verify payment TrxIDs, inspect rosters, and control team status.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={exportToCSV}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-400 border border-slate-800 transition"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={fetchRegistrations}
              disabled={loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 border border-slate-800 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Counter Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 p-3.5 sm:p-4 rounded-xl">
            <p className="text-slate-400 text-[11px] sm:text-xs">Total Entries</p>
            <p className="text-lg sm:text-xl font-bold text-white mt-0.5">{registrations.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3.5 sm:p-4 rounded-xl">
            <p className="text-amber-400 text-[11px] sm:text-xs font-medium">Pending</p>
            <p className="text-lg sm:text-xl font-bold text-amber-400 mt-0.5">
              {registrations.filter((r) => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3.5 sm:p-4 rounded-xl">
            <p className="text-emerald-400 text-[11px] sm:text-xs font-medium">Confirmed</p>
            <p className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5">
              {registrations.filter((r) => r.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-3.5 sm:p-4 rounded-xl">
            <p className="text-red-400 text-[11px] sm:text-xs font-medium">Rejected</p>
            <p className="text-lg sm:text-xl font-bold text-red-400 mt-0.5">
              {registrations.filter((r) => r.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search team, phone, TrxID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 pl-9 pr-8 py-2 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'pending', 'confirmed', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs capitalize transition whitespace-nowrap border ${
                  filterStatus === status
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile View (< 768px) */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Loading registrations...
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
              No team registrations found matching your filters.
            </div>
          ) : (
            filteredRegistrations.map((reg) => (
              <div key={reg.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm">{reg.team_name}</h3>
                    <p className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 shrink-0" /> {reg.institution_name} ({reg.institution_type})
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${
                      reg.status === 'confirmed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : reg.status === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    <span className="capitalize">{reg.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div>
                    <p className="text-slate-500">Captain</p>
                    <p className="text-slate-200 font-semibold">{reg.captain_name}</p>
                    <p className="text-slate-400 text-[10px]">{reg.phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">TrxID</p>
                    <p className="font-mono text-amber-400 font-bold">{reg.trx_id}</p>
                    <p className="text-slate-400 text-[10px]">৳{reg.amount} ({reg.payment_method})</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                  <button
                    onClick={() => setSelectedTeam(reg)}
                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Squad
                  </button>

                  {reg.status !== 'confirmed' && (
                    <button
                      disabled={actionLoading === reg.id}
                      onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                      className="p-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg disabled:opacity-50"
                      title="Approve Team"
                    >
                      {actionLoading === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  )}

                  {reg.status !== 'rejected' && (
                    <button
                      disabled={actionLoading === reg.id}
                      onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                      className="p-1.5 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-lg disabled:opacity-50"
                      title="Reject Team"
                    >
                      {actionLoading === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    </button>
                  )}

                  <button
                    disabled={actionLoading === reg.id}
                    onClick={() => handleDelete(reg.id)}
                    className="p-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg disabled:opacity-50"
                    title="Delete Registration"
                  >
                    {actionLoading === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View (>= 768px) */}
        <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Team & Institution</th>
                  <th className="p-4">Captain Contact</th>
                  <th className="p-4">Payment & TrxID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Loading registrations...
                      </div>
                    </td>
                  </tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No team registrations match your current search query or filter.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{reg.team_name}</div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 shrink-0" /> {reg.institution_name} ({reg.institution_type})
                        </div>
                        {reg.batch_info && (
                          <div className="text-slate-500 text-[10px] flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3 h-3 shrink-0" /> {reg.batch_info}
                          </div>
                        )}
                      </td>

                      <td className="p-4 space-y-1">
                        <div className="font-semibold text-slate-200">{reg.captain_name}</div>
                        <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" /> {reg.phone}
                        </div>
                        <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" /> {reg.email}
                        </div>
                      </td>

                      <td className="p-4 space-y-1">
                        <div className="inline-block bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-amber-400 font-bold">
                          {reg.trx_id}
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-500 shrink-0" /> {reg.payment_method} • ৳{reg.amount}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            reg.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : reg.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {reg.status === 'confirmed' && <CheckCircle className="w-3.5 h-3.5" />}
                          {reg.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                          {reg.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                          <span className="capitalize">{reg.status}</span>
                        </span>
                      </td>

                      <td className="p-4 text-slate-400 text-[11px]">
                        {new Date(reg.created_at).toLocaleDateString()}
                        <div className="text-slate-500 text-[10px]">
                          {new Date(reg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedTeam(reg)}
                            title="View Squad Roster"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {reg.status !== 'confirmed' && (
                            <button
                              disabled={actionLoading === reg.id}
                              onClick={() => handleUpdateStatus(reg.id, 'confirmed')}
                              title="Confirm Team"
                              className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 rounded-lg transition disabled:opacity-50"
                            >
                              {actionLoading === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          )}

                          {reg.status !== 'rejected' && (
                            <button
                              disabled={actionLoading === reg.id}
                              onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                              title="Reject Team"
                              className="p-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 rounded-lg transition disabled:opacity-50"
                            >
                              {actionLoading === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            </button>
                          )}

                          <button
                            disabled={actionLoading === reg.id}
                            onClick={() => handleDelete(reg.id)}
                            title="Delete Registration"
                            className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded-lg transition disabled:opacity-50"
                          >
                            {actionLoading === reg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Squad Modal */}
      {selectedTeam && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedTeam(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400 shrink-0" /> {selectedTeam.team_name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedTeam.institution_name} ({selectedTeam.institution_type})
                </p>
              </div>
              <button
                onClick={() => setSelectedTeam(null)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] sm:text-xs">
              <div>
                <p className="text-slate-500">TrxID</p>
                <p className="font-mono font-bold text-amber-400 truncate">{selectedTeam.trx_id}</p>
              </div>
              <div>
                <p className="text-slate-500">Payment</p>
                <p className="font-semibold text-slate-200">{selectedTeam.payment_method} (৳{selectedTeam.amount})</p>
              </div>
              <div>
                <p className="text-slate-500">Phone</p>
                <p className="font-semibold text-slate-200">{selectedTeam.phone}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-semibold text-slate-200 truncate">{selectedTeam.email}</p>
              </div>
              <div>
                <p className="text-slate-500">Batch Info</p>
                <p className="font-semibold text-slate-200">{selectedTeam.batch_info || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500">Status</p>
                <p className="font-semibold capitalize text-amber-400">{selectedTeam.status}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Submitted Squad Roster ({selectedTeam.players?.length || 0} Members)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedTeam.players && selectedTeam.players.length > 0 ? (
                  [...selectedTeam.players]
                    .sort((a, b) => (a.player_number || 0) - (b.player_number || 0))
                    .map((player) => (
                      <div
                        key={player.id}
                        className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {player.player_number}
                          </span>
                          <div>
                            <p className="font-bold text-white">{player.player_name}</p>
                            <p className="text-[10px] text-slate-500">{player.role}</p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-slate-500 col-span-2">No player roster records found.</p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedTeam(null)}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                Close
              </button>
              {selectedTeam.status !== 'rejected' && (
                <button
                  disabled={actionLoading === selectedTeam.id}
                  onClick={() => handleUpdateStatus(selectedTeam.id, 'rejected')}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === selectedTeam.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Reject
                </button>
              )}
              {selectedTeam.status !== 'confirmed' && (
                <button
                  disabled={actionLoading === selectedTeam.id}
                  onClick={() => handleUpdateStatus(selectedTeam.id, 'confirmed')}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === selectedTeam.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Approve Team
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}