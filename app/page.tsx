import Link from 'next/link';
import { Trophy, Calendar, MapPin, Users, Phone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16 text-center">
        <span className="inline-block bg-yellow-500/20 text-yellow-400 text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full border border-yellow-500/30 leading-snug">
          Rangpur&apos;s Biggest Inter-Educational Cricket Tournament
        </span>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mt-4 tracking-tight leading-tight">
          THE <span className="text-yellow-500">ORIENT BLAST</span>
        </h1>
        <p className="text-base sm:text-xl text-gray-300 font-medium tracking-wide mt-1">
          CRICKET CARNIVAL
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-3 max-w-xl mx-auto leading-relaxed">
          One Match. One Festival. One Legacy. All Open Categories, colleges, universities & medical colleges come together on one platform.
        </p>

        <div className="mt-6 sm:mt-8 flex justify-center">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-6 py-3.5 sm:px-8 sm:py-3.5 rounded-xl transition shadow-lg shadow-yellow-500/20 text-center text-sm sm:text-base"
          >
            Register Team Now (৳3,650 BDT)
          </Link>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-800/60 p-3 sm:p-4 rounded-xl border border-slate-700 text-center flex flex-col justify-center items-center">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mb-2" />
          <h3 className="text-xl sm:text-2xl font-bold">8 Teams</h3>
          <p className="text-[11px] sm:text-xs text-gray-400">Team Participation</p>
        </div>
        <div className="bg-slate-800/60 p-3 sm:p-4 rounded-xl border border-slate-700 text-center flex flex-col justify-center items-center">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mb-2" />
          <h3 className="text-lg sm:text-xl font-bold">25 Sept</h3>
          <p className="text-[11px] sm:text-xs text-gray-400">Tentative Start</p>
        </div>
        <div className="bg-slate-800/60 p-3 sm:p-4 rounded-xl border border-slate-700 text-center flex flex-col justify-center items-center">
          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mb-2" />
          <h3 className="text-base sm:text-lg font-bold leading-tight">Rangpur Stadium</h3>
          <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">Venue</p>
        </div>
        <div className="bg-slate-800/60 p-3 sm:p-4 rounded-xl border border-slate-700 text-center flex flex-col justify-center items-center">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mb-2" />
          <h3 className="text-base sm:text-lg font-bold">04-17 Sept</h3>
          <p className="text-[11px] sm:text-xs text-gray-400">Registration Window</p>
        </div>
      </div>

      {/* Eligibility & Rules */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Eligibility */}
        <div className="bg-slate-800/40 p-5 sm:p-6 rounded-2xl border border-slate-700">
          <h2 className="text-lg sm:text-xl font-bold text-yellow-400 mb-4">Eligibility Criteria</h2>
          <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
            <li>🏫 <strong>Open to All</strong></li>
            <li>🎓 <strong>College:</strong> HSC Batch 26 & 27</li>
            <li>🏛️ <strong>University:</strong> Honours (Current Batch)</li>
            <li>🏥 <strong>Medical College:</strong> Current Batch</li>
          </ul>
        </div>

        {/* Rules */}
        <div className="bg-slate-800/40 p-5 sm:p-6 rounded-2xl border border-slate-700">
          <h2 className="text-lg sm:text-xl font-bold text-yellow-400 mb-4">Rules & Regulations</h2>
          <ul className="space-y-2.5 text-xs sm:text-xs text-gray-300 leading-relaxed">
            <li>• Entry fee is fixed at <strong>3,650 BDT</strong> per team.</li>
            <li>• Each team must register exactly <strong>16 players</strong>.</li>
            <li>• Once booked, registrations cannot be canceled and fees are non-refundable.</li>
            <li>• Participation is not confirmed until payment is verified by the Director of Finance.</li>
          </ul>
        </div>
      </div>

      {/* Board of Directors */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Board of Directors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Shakhawath Shakil', role: 'Spokesman & Director', sub: 'Management, Finance, Sponsor' },
            { name: 'Hasibul Hasan Habib', role: 'Director', sub: 'Umpires' },
            { name: 'Shahjaman Raj', role: 'Director', sub: 'Grounds' },
            { name: 'Fahim Fardin', role: 'Director', sub: 'Logistic' },
          ].map((dir, i) => (
            <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
              <h3 className="font-bold text-sm text-white">{dir.name}</h3>
              <p className="text-xs text-yellow-400 mt-1 font-medium">{dir.role}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{dir.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Organizers */}
      <footer className="border-t border-slate-800 py-6 sm:py-8 px-4 text-center text-xs text-gray-400 space-y-2">
        <p className="max-w-2xl mx-auto leading-relaxed">
          <strong>Organised by:</strong> Pitha Utsob Organising Panel, Business Studies Group, Batch 26, Rangpur Govt. City College, Rangpur
        </p>
        <p className="flex justify-center items-center gap-1.5 text-gray-300 pt-1 flex-wrap">
          <Phone className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          <span>Finance Director (Shakhawat Shakil):</span>
          <a href="tel:01352765784" className="font-bold hover:text-yellow-400 transition">01352765784</a>
        </p>
      </footer>
    </div>
  );
}