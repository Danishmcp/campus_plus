import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EventItem } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  QrCode,
  Award,
  AlertTriangle,
  CheckCircle2,
  X,
  Share2,
  Download,
  Shield,
  ExternalLink,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAuthenticated, isAdmin, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [clashWarning, setClashWarning] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: event, isLoading, error } = useQuery<EventItem>({
    queryKey: ['event', slug],
    queryFn: async () => {
      const res = await api.get(`/events/${slug}`);
      return res.data.data.event;
    },
    enabled: !!slug,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/registrations', { eventId: event?.id });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setActionMessage(data.message);
      if (data.data?.warning) {
        setClashWarning(data.data.warning);
      }
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to complete registration');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      const res = await api.delete(`/registrations/${registrationId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', slug] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setActionMessage('Registration has been successfully cancelled.');
      setClashWarning(null);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to cancel registration');
    },
  });

  const issueCertificatesMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/certificates/issue/${event?.id}`);
      return res.data;
    },
    onSuccess: (data) => {
      setActionMessage(data.message);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to issue certificates');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested event could not be found or may have been cancelled.
        </p>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  const isOrganizerOrAdmin =
    isAdmin || (user && (user.id === event.createdById || isOrganizer));
  const isFull = (event._count?.registrations || 0) >= event.capacity;
  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();
  const userReg = event.userRegistration;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Organizer Action Bar */}
      {isOrganizerOrAdmin && (
        <div className="bg-indigo-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 block">
                Organizer Console
              </span>
              <span className="text-sm font-semibold">
                Event Tools & Check-in Management
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/organizer/scanner/${event.id}`}
              className="px-3.5 py-2 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch QR Scanner</span>
            </Link>

            <button
              onClick={() => issueCertificatesMutation.mutate()}
              disabled={issueCertificatesMutation.isPending}
              className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>
                {issueCertificatesMutation.isPending
                  ? 'Issuing...'
                  : 'Issue Certificates'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Success / Error Feedback Alerts */}
      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span className="font-medium">{actionMessage}</span>
        </div>
      )}

      {clashWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-800">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <span>{clashWarning}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-800">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Event Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Banner Area */}
        <div className="h-48 sm:h-64 bg-gradient-to-tr from-brand-900 via-indigo-800 to-slate-900 p-6 sm:p-8 flex flex-col justify-between text-white relative">
          <div className="flex flex-wrap items-center justify-between gap-3 z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
              {event.category}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                event.status === 'APPROVED'
                  ? 'bg-emerald-500/90'
                  : event.status === 'COMPLETED'
                  ? 'bg-slate-700'
                  : 'bg-amber-500'
              }`}
            >
              {event.status}
            </span>
          </div>

          <div className="z-10 space-y-1">
            <Link
              to={`/clubs/${event.club.slug}`}
              className="text-xs sm:text-sm font-semibold text-brand-200 hover:text-white transition-colors"
            >
              Organized by {event.club.name}
            </Link>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Content Body & Registration Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                About the Event
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block">Date & Time</span>
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>
                    {new Date(event.startDateTime).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block">Venue</span>
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Registration Box */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-5 h-fit">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registration</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {event._count?.registrations || 0} / {event.capacity} seats taken
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFull ? 'bg-amber-500' : 'bg-brand-600'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    ((event._count?.registrations || 0) / event.capacity) * 100
                  )}%`,
                }}
              />
            </div>

            {/* Registration state branches */}
            {!isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Sign in with your student credentials to register for this event and receive your QR check-in ticket.
                </p>
                <Link
                  to="/login"
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Sign In to Register</span>
                </Link>
              </div>
            ) : userReg?.status === 'CONFIRMED' ? (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Your Seat is Confirmed!</span>
                </div>
                <p className="text-emerald-700 text-[11px] leading-relaxed">
                  Present your personal QR ticket at the door for attendance.
                </p>

                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span>View QR Ticket</span>
                </button>

                <button
                  onClick={() => cancelMutation.mutate(userReg.id)}
                  disabled={cancelMutation.isPending}
                  className="w-full py-2 text-rose-600 hover:text-rose-700 font-semibold text-[11px] transition-colors"
                >
                  Cancel Registration
                </button>
              </div>
            ) : userReg?.status === 'WAITLISTED' ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Waitlist Position: #{userReg.waitlistPosition}</span>
                </div>
                <p className="text-amber-700 text-[11px] leading-relaxed">
                  Capacity reached. If a confirmed participant cancels, your registration will be automatically promoted.
                </p>
                <button
                  onClick={() => cancelMutation.mutate(userReg.id)}
                  disabled={cancelMutation.isPending}
                  className="w-full py-2 text-rose-600 hover:text-rose-700 font-semibold text-[11px] transition-colors"
                >
                  Leave Waitlist
                </button>
              </div>
            ) : isDeadlinePassed ? (
              <div className="p-3 bg-slate-200/70 rounded-xl text-center text-xs text-slate-600 font-medium">
                Registration Deadline Has Passed
              </div>
            ) : (
              <div className="space-y-3">
                {isFull && (
                  <p className="text-[11px] text-amber-700 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    Capacity reached. You will be placed on the automated waitlist queue.
                  </p>
                )}
                <button
                  onClick={() => registerMutation.mutate()}
                  disabled={registerMutation.isPending}
                  className={`w-full py-3 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                    isFull
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                      : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'
                  }`}
                >
                  {registerMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>{isFull ? 'Join Event Waitlist' : 'Register for Event'}</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Ticket Pop-up Modal */}
      {isQrModalOpen && userReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Official Event Ticket
              </span>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 inline-block">
              {/* Generate QR image dynamically via external public API or canvas */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  userReg.qrToken
                )}`}
                alt="Ticket QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm">{event.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{user?.name} ({user?.rollNumber || 'Student'})</p>
            </div>

            <p className="text-[10px] text-slate-400">
              Show this QR code to the event coordinator at the venue entrance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
