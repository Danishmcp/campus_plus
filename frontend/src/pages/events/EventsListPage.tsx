import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { EventItem, Club } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Search,
  Clock,
  MapPin,
  Users,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Hackathon',
  'Workshop',
  'Seminar',
  'Coding Contest',
  'Cultural',
  'Tech Talk',
  'Competition',
];

export const EventsListPage: React.FC = () => {
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState('');
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [page, setPage] = useState(1);

  // Fetch clubs for the filter dropdown
  const { data: clubs = [] } = useQuery<Club[]>({
    queryKey: ['clubs-filter'],
    queryFn: async () => {
      const res = await api.get('/clubs');
      return res.data.data.clubs;
    },
  });

  // Fetch events with query parameters
  const { data, isLoading } = useQuery<{
    events: EventItem[];
    pagination: { page: number; totalPages: number; total: number };
  }>({
    queryKey: ['events', search, selectedCategory, selectedClub, timeFilter, page],
    queryFn: async () => {
      const params: any = {
        page,
        limit: 9,
        timeFilter,
      };
      if (search) params.search = search;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedClub) params.clubSlug = selectedClub;

      const res = await api.get('/events', { params });
      return res.data.data;
    },
  });

  const events = data?.events || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-brand-600" />
            <span>Campus Event Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Discover Campus Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse hackathons, technical workshops, seminars, and club activities.
          </p>
        </div>

        {/* Tab Toggle: Upcoming vs Past */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl self-start md:self-auto border border-slate-200/80">
          <button
            onClick={() => {
              setTimeFilter('upcoming');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timeFilter === 'upcoming'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => {
              setTimeFilter('past');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              timeFilter === 'past'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Events
          </button>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by event title, venue, topics, or club..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 shadow-xs"
            />
          </div>

          <div>
            <select
              value={selectedClub}
              onChange={(e) => {
                setSelectedClub(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 shadow-xs"
            >
              <option value="">All Organizing Clubs</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-3xl bg-slate-200/60 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No events match your current search criteria or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const isFull = (evt._count?.registrations || 0) >= evt.capacity;
            const regStatus = evt.userRegistration?.status;

            return (
              <div
                key={evt.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Event Card Header / Banner */}
                <div>
                  <div className="h-36 bg-gradient-to-tr from-brand-700 via-indigo-600 to-slate-900 p-5 flex flex-col justify-between relative overflow-hidden text-white">
                    <div className="flex items-center justify-between z-10">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
                        {evt.category}
                      </span>

                      {/* User Registration Status Badge */}
                      {regStatus === 'CONFIRMED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Registered</span>
                        </span>
                      )}
                      {regStatus === 'WAITLISTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Waitlist #{evt.userRegistration?.waitlistPosition}</span>
                        </span>
                      )}
                    </div>

                    <div className="z-10">
                      <span className="text-[11px] font-medium text-brand-200 block truncate">
                        {evt.club.name}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 pt-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {new Date(evt.startDateTime).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {evt._count?.registrations || 0} / {evt.capacity} registered
                    </span>
                    {isFull && timeFilter === 'upcoming' && (
                      <span className="text-amber-600 font-semibold text-[11px]">
                        Waitlist Active
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-amber-500' : 'bg-brand-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          ((evt._count?.registrations || 0) / evt.capacity) * 100
                        )}%`,
                      }}
                    />
                  </div>

                  <Link
                    to={`/events/${evt.slug}`}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-brand-600 text-slate-700 hover:text-white font-semibold text-xs rounded-xl border border-slate-200/80 hover:border-transparent transition-all flex items-center justify-center gap-2"
                  >
                    <span>View Event Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-600 px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
