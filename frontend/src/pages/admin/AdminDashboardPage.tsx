import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import {
  ShieldCheck,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export const AdminDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [rejectingEvent, setRejectingEvent] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Fetch admin analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await api.get('/analytics/admin');
      return res.data.data;
    },
  });

  // Fetch moderation queue
  const { data: pendingEvents = [], refetch: refetchQueue } = useQuery({
    queryKey: ['admin-queue'],
    queryFn: async () => {
      const res = await api.get('/events/queue/pending');
      return res.data.data.queue;
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async (payload: { eventId: string; status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }) => {
      const res = await api.patch(`/events/${payload.eventId}/moderate`, {
        status: payload.status,
        rejectionReason: payload.rejectionReason,
      });
      return res.data;
    },
    onSuccess: (resData) => {
      setActionMessage(resData.message);
      setRejectingEvent(null);
      setRejectionReason('');
      refetchQueue();
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
    },
  });

  const totals = analytics?.totals || {
    users: 0,
    clubs: 0,
    events: 0,
    registrations: 0,
    attendances: 0,
    certificates: 0,
    attendanceRate: '0%',
  };

  const categoryData = analytics?.categoryStats || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Administrative Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Platform Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Platform governance, event proposal moderation, student attendance metrics, and club analytics.
          </p>
        </div>

        <div className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-2xl text-center self-start md:self-auto">
          <span className="text-lg font-black text-purple-700 block">
            {pendingEvents.length}
          </span>
          <span className="text-[10px] uppercase font-bold text-purple-500">
            Pending Proposals
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
          <span className="font-semibold">{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-emerald-700 underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Platform Totals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Users</span>
          <span className="text-xl font-black text-slate-900 block">{totals.users}</span>
          <span className="text-[10px] text-slate-500">Accounts</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Clubs</span>
          <span className="text-xl font-black text-indigo-600 block">{totals.clubs}</span>
          <span className="text-[10px] text-slate-500">Societies</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Events</span>
          <span className="text-xl font-black text-slate-900 block">{totals.events}</span>
          <span className="text-[10px] text-slate-500">Published</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Registrations</span>
          <span className="text-xl font-black text-brand-600 block">{totals.registrations}</span>
          <span className="text-[10px] text-slate-500">Tickets Issued</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Attendances</span>
          <span className="text-xl font-black text-emerald-600 block">{totals.attendances}</span>
          <span className="text-[10px] text-slate-500">Check-ins</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Turnout Rate</span>
          <span className="text-xl font-black text-purple-600 block">{totals.attendanceRate}</span>
          <span className="text-[10px] text-slate-500">Verified</span>
        </div>
      </div>

      {/* Moderation Queue Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Event Approval Queue</h2>
            <p className="text-xs text-slate-500">
              Review event proposals submitted by student club organizers before they go live
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            {pendingEvents.length} Pending Approval
          </span>
        </div>

        {pendingEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <span className="font-semibold text-slate-700 block">Queue is Clean!</span>
            No pending event proposals awaiting review.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingEvents.map((evt: any) => (
              <div
                key={evt.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                      {evt.club.name}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Proposed by {evt.createdBy.name} ({evt.createdBy.department || evt.createdBy.email})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{evt.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{evt.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(evt.startDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {evt.venue}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Capacity: {evt.capacity}
                    </span>
                  </div>
                </div>

                {/* Moderation Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    onClick={() =>
                      moderateMutation.mutate({
                        eventId: evt.id,
                        status: 'APPROVED',
                      })
                    }
                    disabled={moderateMutation.isPending}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => {
                      setRejectingEvent(evt);
                      setRejectionReason('');
                    }}
                    disabled={moderateMutation.isPending}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Events Distribution by Domain
          </h3>
          <p className="text-xs text-slate-500">Popularity breakdown across event categories</p>
          <div className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e1b4b',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Event Pipeline Distribution
          </h3>
          <p className="text-xs text-slate-500">Active vs. completed vs. pending event statuses</p>
          <div className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.eventsByStatus || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(analytics?.eventsByStatus || []).map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Reject Event Proposal
              </h3>
              <button
                onClick={() => setRejectingEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please provide feedback explaining why "<strong>{rejectingEvent.title}</strong>" is being rejected. This reason will be emailed directly to the organizer.
            </p>

            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Venue is booked for convocation; please reschedule for the following weekend."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingEvent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim() || moderateMutation.isPending}
                onClick={() =>
                  moderateMutation.mutate({
                    eventId: rejectingEvent.id,
                    status: 'REJECTED',
                    rejectionReason,
                  })
                }
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                {moderateMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
