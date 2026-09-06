'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegistrationPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Main Registration Form
  const [formData, setFormData] = useState({
    team_name: '',
    institution_type: 'College',
    institution_name: '',
    batch_info: '',
    captain_name: '',
    phone: '',
    email: '',
    payment_method: 'bKash',
    trx_id: '',
  });

  // 16 Players State Initialization
  const [players, setPlayers] = useState<Array<{ name: string; role: string }>>(
    Array(16).fill(null).map(() => ({ name: '', role: 'Batsman' }))
  );

  const handlePlayerChange = (index: number, field: 'name' | 'role', value: string) => {
    const updated = [...players];
    updated[index][field] = value;
    setPlayers(updated);
  };

  const handleNextToStep2 = () => {
    setError('');
    if (
      !formData.team_name.trim() ||
      !formData.institution_name.trim() ||
      !formData.captain_name.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim()
    ) {
      setError('Please fill in all required fields (*) in Step 1 before proceeding.');
      return;
    }
    setStep(2);
  };

  const handleNextToStep3 = () => {
    setError('');
    const hasEmptyPlayer = players.some((p) => !p.name.trim());
    if (hasEmptyPlayer) {
      setError('Please fill in all 16 player names before proceeding to payment.');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.trx_id.trim()) {
      setError('Please enter a valid Transaction ID (TrxID).');
      setLoading(false);
      return;
    }

    try {
      const teamPayload = {
        team_name: formData.team_name.trim(),
        institution_type: formData.institution_type,
        institution_name: formData.institution_name.trim(),
        batch_info: formData.batch_info.trim(),
        captain_name: formData.captain_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        payment_method: formData.payment_method,
        amount: 3650.00,
        trx_id: formData.trx_id.trim().toUpperCase(),
        status: 'pending',
      };

      const playersPayload = players.map((p, idx) => ({
        player_name: p.name.trim(),
        role: p.role,
        player_number: idx + 1,
      }));

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamData: teamPayload,
          playersData: playersPayload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error && result.error.includes('23505')) {
          throw new Error('This Transaction ID (TrxID) has already been submitted.');
        }
        throw new Error(result.error || 'Submission failed');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Submission failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-xl mx-auto my-4 sm:my-10 p-5 sm:p-8 bg-slate-800 text-white rounded-2xl border border-slate-700 text-center space-y-4 px-4">
        <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400 mx-auto" />
        <h2 className="text-xl sm:text-2xl font-bold">Registration Submitted!</h2>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
          Your payment of <strong>৳3,650 BDT</strong> (TrxID: <span className="font-mono text-yellow-400 break-all">{formData.trx_id}</span>) is under review by organizers.
        </p>
        <p className="text-xs sm:text-sm text-slate-400 mt-4">
          Once reviewed, your team status will be updated to <span className="font-semibold text-emerald-400">CONFIRMED</span> via email.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto my-2 sm:my-6 p-3.5 sm:p-7 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl">
      <h1 className="text-lg sm:text-2xl font-bold text-center mb-1">Team Registration Form</h1>
      <p className="text-center text-[10px] sm:text-xs text-yellow-400 mb-5 font-medium tracking-wide">
        THE ORIENT BLAST CRICKET CARNIVAL
      </p>

      {error && (
        <div className="mb-5 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm rounded-xl flex items-center gap-2">
          <div className="shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span>{error}</span>
        </div>
      )}

      {/* Responsive Step Indicator */}
      <div className="flex items-center justify-between text-[11px] sm:text-sm font-semibold mb-5 sm:mb-8 border-b border-slate-800 pb-3 gap-1">
        <span className={step >= 1 ? 'text-yellow-400' : 'text-gray-600'}>
          <span className="sm:hidden">1. Info</span>
          <span className="hidden sm:inline">1. Institution & Captain</span>
        </span>
        <span className="text-gray-600 text-xs">➔</span>
        <span className={step >= 2 ? 'text-yellow-400' : 'text-gray-600'}>
          <span className="sm:hidden">2. Squad</span>
          <span className="hidden sm:inline">2. Squad (16 Players)</span>
        </span>
        <span className="text-gray-600 text-xs">➔</span>
        <span className={step >= 3 ? 'text-yellow-400' : 'text-gray-600'}>
          <span className="sm:hidden">3. Payment</span>
          <span className="hidden sm:inline">3. Payment (৳3,650)</span>
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-300">Team Name *</label>
              <input
                type="text"
                required
                value={formData.team_name}
                onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-yellow-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-300">Institution Category *</label>
                <select
                  value={formData.institution_type}
                  onChange={(e) => setFormData({ ...formData, institution_type: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-yellow-500"
                >
                  <option value="School">School</option>
                  <option value="College">College</option>
                  <option value="University">University</option>
                  <option value="Medical College">Medical College</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-300">Institution Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rangpur Govt. City College"
                  value={formData.institution_name}
                  onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-300">Batch Info</label>
                <input
                  type="text"
                  placeholder="e.g. HSC 26"
                  value={formData.batch_info}
                  onChange={(e) => setFormData({ ...formData, batch_info: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-300">Captain Name *</label>
                <input
                  type="text"
                  required
                  value={formData.captain_name}
                  onChange={(e) => setFormData({ ...formData, captain_name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-300">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-300">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-yellow-500"
              />
            </div>

            <button
              type="button"
              onClick={handleNextToStep2}
              className="w-full bg-yellow-500 text-slate-950 font-bold py-3 rounded-xl mt-4 hover:bg-yellow-400 transition text-xs sm:text-base"
            >
              Next: Enter Player List (16 Players)
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-semibold text-yellow-400 mb-2">16 Squad Players (As per Rules)</h3>
            <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto space-y-2.5 pr-1 sm:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {players.map((player, idx) => (
                <div key={idx} className="flex flex-row gap-2 items-center bg-slate-800 p-2 sm:p-3 rounded-lg border border-slate-700 text-xs">
                  <span className="w-5 font-bold text-gray-400 text-xs shrink-0 text-center">#{idx + 1}</span>
                  <input
                    type="text"
                    required
                    placeholder={`Player ${idx + 1} Name *`}
                    value={player.name}
                    onChange={(e) => handlePlayerChange(idx, 'name', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 px-2.5 py-2 rounded outline-none focus:border-yellow-500 text-xs sm:text-sm min-w-0"
                  />
                  <select
                    value={player.role}
                    onChange={(e) => handlePlayerChange(idx, 'role', e.target.value)}
                    className="w-28 sm:w-36 bg-slate-900 border border-slate-700 px-2 py-2 rounded outline-none focus:border-yellow-500 text-xs shrink-0"
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicket-Keeper">Wicket-Keeper</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setStep(1);
                }}
                className="w-1/2 border border-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-800 text-xs sm:text-sm"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNextToStep3}
                className="w-1/2 bg-yellow-500 text-slate-950 font-bold py-3 rounded-xl hover:bg-yellow-400 transition text-xs sm:text-sm"
              >
                Next: Payment Details
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-pink-950/30 border border-pink-500/30 p-3.5 sm:p-4 rounded-xl text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-pink-500/20 pb-2">
                <span className="bg-pink-600 text-white font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded">
                  bKash Personal
                </span>
                <span className="font-bold text-yellow-400 text-xs">
                  Fee: BDT 3,650
                </span>
              </div>
              
              <p className="text-gray-300">
                Send BDT 3,650 via <strong className="text-white">Send Money</strong> to:
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800 gap-2">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Account Holder Name</p>
                  <p className="text-sm font-bold text-white">Fahim Fardin</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">bKash Number</p>
                  <p className="text-base font-mono font-bold text-pink-400">01815018984</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-300">Payment Gateway *</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-lg text-sm outline-none focus:border-pink-500"
              >
                <option value="bKash">bKash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-300">Transaction ID (TrxID) *</label>
              <input
                type="text"
                required
                placeholder="e.g. BKASH992831"
                value={formData.trx_id}
                onChange={(e) => setFormData({ ...formData, trx_id: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-lg text-sm uppercase tracking-wider font-mono outline-none focus:border-pink-500 text-white"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Enter the exact transaction ID received from bKash SMS after payment.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setStep(2);
                }}
                className="w-1/2 border border-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-800 text-xs sm:text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-pink-600 text-white font-bold py-3 rounded-xl hover:bg-pink-500 transition disabled:opacity-50 text-xs sm:text-sm shadow-md"
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}