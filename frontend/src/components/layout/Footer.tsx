import React from 'react';
import { Calendar, Heart, Shield, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">CampusPulse</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified College Event & Club Management Platform. Empowering campus life through seamless registrations, verifiable certificates, and automated attendance.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/events" className="hover:text-white transition-colors">Upcoming Events</a></li>
              <li><a href="/clubs" className="hover:text-white transition-colors">Student Clubs</a></li>
              <li><a href="/verify" className="hover:text-white transition-colors">Certificate Verification</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Portal Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/login" className="hover:text-white transition-colors">Student Sign In</a></li>
              <li><a href="/organizer" className="hover:text-white transition-colors">Club Organizer Console</a></li>
              <li><a href="/admin" className="hover:text-white transition-colors">Administrative Analytics</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Security & Stack
            </h4>
            <div className="space-y-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Signed QR Verification
              </span>
              <p className="text-[11px] text-slate-500">
                Pure TypeScript • React 18 + Node.js Express • PostgreSQL & Prisma ORM
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} CampusPulse Portal. Engineered for College Excellence.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Students & Clubs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
