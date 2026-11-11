import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Award,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'tickets' | 'waitlist' | 'certificates'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Fetch my tickets
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const res = await api.get('/registrations/my-tickets');
      return res.data.data.registrations;
    },
  });

  // Fetch my certificates
  const { data: certsData, isLoading: certsLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: async () => {
      const res = await api.get('/certificates/my-certificates');
      return res.data.data.certificates;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (regId: string) => {
      const res = await api.delete(`/registrations/${regId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });

  const allRegistrations: any[] = ticketsData || [];
  const confirmedTickets = allRegistrations.filter((r) => r.status === 'CONFIRMED');
  const waitlistedTickets = allRegistrations.filter((r) => r.status === 'WAITLISTED');
  const certificates: any[] = certsData || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <span>Student Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View your active event tickets, track waitlist spots, and download verified certificates.
          </p>
        </div>

        <Link
          to="/events"
          className="self-start md:self-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          Explore More Events
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Active Tickets ({confirmedTickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('waitlist')}
          className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'waitlist'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Waitlist Queue ({waitlistedTickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'certificates'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Certificates ({certificates.length})</span>
        </button>
      </div>

      {/* Tab 1: Confirmed Tickets */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {ticketsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : confirmedTickets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-3">
              <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Active Tickets</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't registered for any upcoming events yet. Discover student workshops and hackathons today!
              </p>
              <Link
                to="/events"
                className="inline-block mt-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {confirmedTickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmed</span>
                      </span>

                      {t.attendance && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          Checked In
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                      {t.event.title}
                    </h3>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(t.event.startDateTime).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.event.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Display QR Ticket</span>
                    </button>

                    <button
                      onClick={() => cancelMutation.mutate(t.id)}
                      disabled={cancelMutation.isPending}
                      className="w-full py-1.5 text-rose-600 hover:text-rose-700 font-semibold text-[11px]"
                    >
                      Cancel Registration
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Waitlist Queue */}
      {activeTab === 'waitlist' && (
        <div className="space-y-4">
          {waitlistedTickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 text-xs text-slate-400">
              You are not currently on any event waitlists.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {waitlistedTickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Waitlist Position: #{t.waitlistPosition}</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      Auto-promotion enabled
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {t.event.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Venue: {t.event.venue} • Starts {new Date(t.event.startDateTime).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                    If any registered participant cancels their ticket, the system will automatically promote your registration and notify you via email!
                  </p>

                  <button
                    onClick={() => cancelMutation.mutate(t.id)}
                    disabled={cancelMutation.isPending}
                    className="w-full py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
                  >
                    Leave Waitlist
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Certificates */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          {certsLoading ? (
            <div className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ) : certificates.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-3">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Certificates Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                After you attend an event and the organizer verifies your attendance, your official participation certificate will be published here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                      {cert.event.title}
                    </h3>
                    <span className="text-xs text-slate-500 block">
                      Organized by {cert.event.club.name}
                    </span>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        Certificate Code
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {cert.certificateCode}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                    {cert.pdfUrl && (
                      <a
                        href={cert.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF Certificate</span>
                      </a>
                    )}

                    <Link
                      to={`/verify/${cert.certificateCode}`}
                      className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verify Authenticity</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Ticket QR Code
              </span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  selectedTicket.qrToken
                )}`}
                alt="Ticket QR Code"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                {selectedTicket.event.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {user?.name} ({user?.rollNumber || 'Student'})
              </p>
            </div>

            <p className="text-[10px] text-slate-400">
              Present this code to the event coordinator to scan at the venue entrance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
