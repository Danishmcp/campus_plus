import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../../api/client';
import {
  QrCode,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Users,
  Download,
  Search,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

export const QRScannerPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [manualInput, setManualInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    student?: { name: string; rollNumber?: string; department?: string };
    time?: string;
  } | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Fetch verified attendees roster
  const { data: attendees = [], refetch: refetchAttendees } = useQuery<any[]>({
    queryKey: ['attendees', eventId],
    queryFn: async () => {
      const res = await api.get(`/attendance/event/${eventId}`);
      return res.data.data.attendees;
    },
    enabled: !!eventId,
  });

  const scanMutation = useMutation({
    mutationFn: async (qrToken: string) => {
      const res = await api.post('/attendance/scan', { eventId, qrToken });
      return res.data;
    },
    onSuccess: (data) => {
      const user = data.data.attendance.user;
      setScanResult({
        type: 'success',
        message: 'Attendance Verified Successfully!',
        student: user,
        time: new Date().toLocaleTimeString(),
      });
      refetchAttendees();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Check-in validation failed';
      setScanResult({
        type: err.response?.status === 409 ? 'warning' : 'error',
        message: msg,
      });
    },
  });

  const manualCheckInMutation = useMutation({
    mutationFn: async (studentIdentifier: string) => {
      const res = await api.post('/attendance/manual', {
        eventId,
        studentIdentifier,
      });
      return res.data;
    },
    onSuccess: (data) => {
      const user = data.data.attendance.user;
      setScanResult({
        type: 'success',
        message: 'Manual Attendance Recorded!',
        student: user,
        time: new Date().toLocaleTimeString(),
      });
      setManualInput('');
      refetchAttendees();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Manual check-in failed';
      setScanResult({
        type: err.response?.status === 409 ? 'warning' : 'error',
        message: msg,
      });
    },
  });

  // Initialize html5-qrcode scanner on mount
  useEffect(() => {
    if (activeTab === 'scan') {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          scanMutation.mutate(decodedText);
        },
        (_error) => {
          // ignore transient frame decode failures
        }
      );

      scannerRef.current = scanner;

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [activeTab]);

  const handleDownloadCSV = () => {
    window.open(`/api/v1/attendance/event/${eventId}/export`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/organizer"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Organizer Console</span>
        </Link>
      </div>

      {/* Header bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
            Real-Time Attendance Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            QR Scanner & Check-in Desk
          </h1>
          <p className="text-xs text-slate-500">
            Scan signed student QR tickets or search by roll number for rapid verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-brand-50 border border-brand-200 rounded-2xl text-center">
            <span className="text-lg font-black text-brand-700 block">
              {attendees.length}
            </span>
            <span className="text-[10px] uppercase font-bold text-brand-500">
              Verified Attendees
            </span>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Verification Flash Alert Banner */}
      {scanResult && (
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            scanResult.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : scanResult.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {scanResult.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            )}
            <div>
              <span className="font-bold text-sm block">{scanResult.message}</span>
              {scanResult.student && (
                <div className="text-xs font-medium opacity-90 mt-0.5">
                  <strong>{scanResult.student.name}</strong> • Roll: {scanResult.student.rollNumber || 'N/A'} • {scanResult.student.department || ''}
                </div>
              )}
            </div>
          </div>
          {scanResult.time && (
            <span className="text-[11px] font-mono opacity-75">
              Verified at {scanResult.time}
            </span>
          )}
        </div>
      )}

      {/* Scanner & Manual Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('scan')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'scan'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Live Camera Scan
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'manual'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Manual Search Fallback
              </button>
            </div>
          </div>

          {activeTab === 'scan' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 text-center">
                Point the student's mobile ticket QR code at the camera. Verification happens instantly.
              </p>
              <div
                id="qr-reader-container"
                className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900"
              />
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualInput.trim()) {
                  manualCheckInMutation.mutate(manualInput);
                }
              }}
              className="space-y-4 py-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Student Roll Number or College Email
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g. CS2024001 or student@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={manualCheckInMutation.isPending}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>
                  {manualCheckInMutation.isPending
                    ? 'Verifying...'
                    : 'Check In Student'}
                </span>
              </button>
            </form>
          )}
        </div>

        {/* Live Attendee Stream */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Live Check-in Feed
              </h3>
              <button
                onClick={() => refetchAttendees()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Refresh Roster"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {attendees.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No check-ins recorded yet for this session.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {attendees.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {a.user.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {a.user.rollNumber || a.user.email}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(a.markedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
