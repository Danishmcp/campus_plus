import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import {
  Award,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Building,
  User as UserIcon,
  ExternalLink,
} from 'lucide-react';

export const VerifyCertificatePage: React.FC = () => {
  const { code: urlCode } = useParams<{ code?: string }>();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState(urlCode || '');
  const [activeCode, setActiveCode] = useState(urlCode || '');

  useEffect(() => {
    if (urlCode) {
      setInputCode(urlCode);
      setActiveCode(urlCode);
    }
  }, [urlCode]);

  const { data: cert, isLoading, error } = useQuery({
    queryKey: ['verify-cert', activeCode],
    queryFn: async () => {
      const res = await api.get(`/certificates/verify/${activeCode}`);
      return res.data.data.certificate;
    },
    enabled: !!activeCode,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setActiveCode(inputCode.trim());
      navigate(`/verify/${inputCode.trim()}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/25">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Public Certificate Registry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Verify the authenticity of participation certificates issued by campus clubs and organizations.
        </p>
      </div>

      {/* Lookup search bar */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            required
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="e.g. CERT-HAC-A1B2C3"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 font-mono shadow-xs"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0"
        >
          Verify ID
        </button>
      </form>

      {/* Result Cards */}
      {isLoading ? (
        <div className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
      ) : error ? (
        <div className="p-8 bg-white rounded-3xl border border-rose-200 shadow-xs text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">Certificate Record Not Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The code "<strong>{activeCode}</strong>" could not be validated. Please check the spelling or scan the QR code on the certificate.
          </p>
        </div>
      ) : cert ? (
        <div className="bg-white rounded-3xl border border-emerald-200/80 p-6 sm:p-10 shadow-lg space-y-6 relative overflow-hidden">
          {/* Verified Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Officially Verified Record
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Authentic Certificate of Participation
                </h2>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono block">
                Certificate Code
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {cert.certificateCode}
              </span>
            </div>
          </div>

          {/* Recipient & Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-semibold block">Presented To</span>
              <span className="text-base font-bold text-slate-900 block">
                {cert.user.name}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                {cert.user.rollNumber || 'Student ID on File'} • {cert.user.department || ''}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-semibold block">Event & Host Society</span>
              <span className="text-base font-bold text-slate-900 block truncate">
                {cert.event.title}
              </span>
              <span className="text-slate-500 text-[11px] block">
                Organized by {cert.event.club.name}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block">Issue Date</span>
              <span className="font-semibold text-slate-800">
                {new Date(cert.issueDate).toLocaleDateString([], {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block">Issued By</span>
              <span className="font-semibold text-slate-800">
                {cert.issuedBy?.name || 'Club Lead Coordinator'}
              </span>
            </div>
          </div>

          {/* PDF Download Button */}
          {cert.pdfUrl && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <a
                href={cert.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF Document</span>
              </a>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
