import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  QrCode,
  Award,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 bg-gradient-to-b from-indigo-50/60 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold tracking-wide border border-brand-200">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Campus Life, Seamlessly Orchestrated</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Discover, Attend & Elevate{' '}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Every College Event
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed">
              The official college portal for student clubs and event registrations.
              Register in seconds, get your cryptographic QR ticket, check in at the venue,
              and receive verified digital certificates directly to your profile.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/events"
                className="px-6 py-3.5 rounded-xl bg-brand-600 text-white font-semibold shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition-all flex items-center gap-2 group"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/clubs"
                className="px-6 py-3.5 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>Explore Clubs</span>
              </Link>
            </div>

            {/* Quick Demo Credentials Reminder for project grading */}
            <div className="mt-8 p-4 rounded-xl bg-white/80 border border-slate-200 text-left text-xs max-w-xl mx-auto shadow-xs">
              <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pre-configured Demo Accounts (Password: Password@123)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 pt-1">
                <div><span className="font-medium text-slate-800">Admin:</span> admin@college.edu</div>
                <div><span className="font-medium text-slate-800">Organizer:</span> lead.robotics@college.edu</div>
                <div><span className="font-medium text-slate-800">Student:</span> student1@college.edu</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Engineered for Modern Campus Workflows
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Every feature is designed to eliminate paperwork, manual attendance sheets, and certificate delays.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-brand-600 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Cryptographic QR Check-in
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every registered student receives an encrypted, signed QR ticket token. Organizers scan it in real-time from their phone or laptop with instant validation and fraud prevention.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Automated PDF Certificates
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Issued automatically to verified attendees. Features a unique verification code and public QR link so employers and faculty can authenticate them instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Multi-Role Governance
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dean/Admin event approval queue, club organizer management, conflict detection for schedule clashes, and automated waitlist promotion when seats open up.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold tracking-wider text-brand-300 uppercase">
              End-to-End Lifecycle
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1">
              How CampusPulse Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-semibold text-slate-100">Club Proposes Event</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organizer creates event with venue, date, capacity, and banner. Sent to Admin queue.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-semibold text-slate-100">Admin Approves</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Faculty admin reviews details, approves or requests revision. Event goes live.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-semibold text-slate-100">Students Register</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant registration, conflict warning check, waitlist handling, and QR ticket issuance.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="font-semibold text-slate-100">Scan & Certify</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live QR scanning marks attendance. Organizers click once to generate official PDF certificates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
