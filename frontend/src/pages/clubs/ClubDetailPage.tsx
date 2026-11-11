import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EventItem, ClubMember } from '../../types';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Shield,
  UserCheck,
  Plus,
  Trash2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ClubDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'members'>('upcoming');

  const { data, isLoading, error } = useQuery({
    queryKey: ['club', slug],
    queryFn: async () => {
      const res = await api.get(`/clubs/${slug}`);
      return res.data.data.club;
    },
    enabled: !!slug,
  });

  const club = data;
  const isClubLead =
    isAdmin ||
    (club && user && (club.leadId === user.id || club.members?.some((m: any) => m.userId === user.id && (m.role === 'LEAD' || m.role === 'CO_LEAD'))));

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading club details...</p>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Club Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested club profile could not be retrieved or has been removed.
        </p>
        <Link
          to="/clubs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clubs Directory</span>
        </Link>
      </div>
    );
  }

  const upcomingEvents: EventItem[] = club.upcomingEvents || [];
  const pastEvents: EventItem[] = club.pastEvents || [];
  const members: ClubMember[] = club.members || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/clubs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Clubs</span>
        </Link>
      </div>

      {/* Club Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-extrabold text-3xl shadow-xl shadow-brand-500/25 shrink-0">
              {club.name.charAt(0)}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {club.name}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                  {club.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {club.description}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 self-start md:self-auto shrink-0">
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-xl font-black text-slate-900">
                {members.length}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Members
              </span>
            </div>
            <div className="text-center px-3">
              <span className="block text-xl font-black text-slate-900">
                {upcomingEvents.length + pastEvents.length}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">
                Events
              </span>
            </div>
          </div>
        </div>

        {/* Lead Info Banner */}
        {club.lead && (
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Faculty / Student Lead:</span>
              <span className="font-semibold text-slate-800">{club.lead.name}</span>
              <span className="text-slate-400">({club.lead.email})</span>
            </div>
            {isClubLead && (
              <span className="inline-flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>You have Organizer privileges for this club</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Upcoming Events ({upcomingEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'past'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Past Events ({pastEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'members'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leadership & Members ({members.length})</span>
        </button>
      </div>

      {/* Tab 1: Upcoming Events */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-2">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No upcoming events scheduled</p>
              <p className="text-xs text-slate-400">Stay tuned or check back soon for upcoming workshops and hackathons.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        {evt.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {evt._count?.registrations || 0} / {evt.capacity} seats filled
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{evt.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 pt-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(evt.startDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100">
                    <Link
                      to={`/events/${evt.slug}`}
                      className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <span>View & Register</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Past Events */}
      {activeTab === 'past' && (
        <div className="space-y-4">
          {pastEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No completed events yet</p>
              <p className="text-xs text-slate-400">Past events and certificates will be archived here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pastEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between opacity-90"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        COMPLETED
                      </span>
                      <span className="text-xs text-slate-400">
                        {evt._count?.attendances || 0} verified attendees
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{evt.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{evt.description}</p>

                    <div className="text-xs text-slate-500 pt-1 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Concluded on {new Date(evt.endDateTime).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <Link
                      to={`/events/${evt.slug}`}
                      className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Event Archive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Members & Leadership */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Club Members</h3>
              <p className="text-xs text-slate-500">Student leadership and active contributors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                  {m.user.name.charAt(0)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {m.user.name}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        m.role === 'LEAD'
                          ? 'bg-purple-100 text-purple-700'
                          : m.role === 'CO_LEAD'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {m.user.email}
                  </span>
                  {m.user.department && (
                    <span className="text-[10px] text-slate-400 block truncate">
                      {m.user.department}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
