import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import {
  Calendar,
  Users,
  QrCode,
  Award,
  Download,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';

export const OrganizerDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['organizer-analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/organizer');
      return res.data.data;
    },
  });

  const issueCertificatesMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await api.post(`/certificates/issue/${eventId}`);
      return res.data;
    },
    onSuccess: (resData) => {
      setFeedback(resData.message);
      queryClient.invalidateQueries({ queryKey: ['organizer-analytics'] });
    },
    onError: (err: any) => {
      setFeedback(err.response?.data?.message || 'Failed to issue certificates');
    },
  });

  const totals = data?.totals || {
    clubsCount: 0,
    eventsCount: 0,
    registrationsCount: 0,
    attendeesCount: 0,
    attendanceRate: '0%',
  };

  const clubs = data?.clubs || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Club Management & Execution Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Organizer Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create events, manage registrations, scan QR tickets, and distribute certificates.
          </p>
        </div>

        <Link
          to="/organizer/events/create"
          className="self-start md:self-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Propose New Event</span>
        </Link>
      </div>

      {feedback && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs text-indigo-900">
          <span>{feedback}</span>
          <button
            onClick={() => setFeedback(null)}
            className="font-bold underline text-indigo-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            Total Club Events
          </span>
          <span className="text-2xl font-black text-slate-900 block">
            {totals.eventsCount}
          </span>
          <span className="text-[11px] text-slate-500">Across your societies</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            Total Registrations
          </span>
          <span className="text-2xl font-black text-indigo-600 block">
            {totals.registrationsCount}
          </span>
          <span className="text-[11px] text-slate-500">Confirmed seats booked</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            Verified Attendees
          </span>
          <span className="text-2xl font-black text-emerald-600 block">
            {totals.attendeesCount}
          </span>
          <span className="text-[11px] text-slate-500">QR scanned at doors</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            Attendance Rate
          </span>
          <span className="text-2xl font-black text-purple-600 block">
            {totals.attendanceRate}
          </span>
          <span className="text-[11px] text-slate-500">Turnout efficiency</span>
        </div>
      </div>

      {/* Events Hosted by Organizer's Clubs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Club Events</h2>
            <p className="text-xs text-slate-500">Live attendance controls, certificate issuance, and attendee rosters</p>
          </div>
        </div>

        {isLoading ? (
          <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
        ) : clubs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            You are not currently assigned as a lead for any club.
          </div>
        ) : (
          <div className="space-y-6">
            {clubs.map((c: any) => (
              <div key={c.id} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">{c.name}</h3>
                  <span className="text-xs text-slate-400 font-medium">({c.events.length} events)</span>
                </div>

                {c.events.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No events created for this club yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {c.events.map((evt: any) => (
                      <div
                        key={evt.id}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                evt.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : evt.status === 'PENDING_APPROVAL'
                                  ? 'bg-amber-100 text-amber-800'
                                  : evt.status === 'COMPLETED'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {evt.status}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {evt._count.registrations} / {evt.capacity} seats
                            </span>
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm">
                            {evt.title}
                          </h4>

                          <div className="text-[11px] text-slate-500 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(evt.startDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{evt.venue}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-slate-200/70 flex flex-wrap items-center gap-2">
                          {evt.status === 'APPROVED' && (
                            <Link
                              to={`/organizer/scanner/${evt.id}`}
                              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Live Scanner</span>
                            </Link>
                          )}

                          <a
                            href={`/api/v1/attendance/event/${evt.id}/export`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Export CSV</span>
                          </a>

                          <button
                            onClick={() => issueCertificatesMutation.mutate(evt.id)}
                            disabled={issueCertificatesMutation.isPending}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg border border-indigo-200 transition-colors flex items-center gap-1"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Issue Certs ({evt._count.attendances} attendees)</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
