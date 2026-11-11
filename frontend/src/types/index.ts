export type Role = 'ADMIN' | 'ORGANIZER' | 'STUDENT';

export type EventStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED';

export type RegistrationStatus = 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';

export type NotificationType =
  | 'REGISTRATION'
  | 'REMINDER'
  | 'EVENT_UPDATE'
  | 'WAITLIST'
  | 'CERTIFICATE'
  | 'APPROVAL'
  | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  department?: string;
  rollNumber?: string;
  avatar?: string;
  createdAt: string;
}

export interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  role: 'LEAD' | 'CO_LEAD' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logo?: string;
  banner?: string;
  leadId?: string;
  lead?: User;
  isActive: boolean;
  createdAt: string;
  _count?: {
    members: number;
    events: number;
  };
}

export interface EventItem {
  id: string;
  clubId: string;
  club: {
    id: string;
    name: string;
    slug: string;
    category: string;
    logo?: string;
  };
  title: string;
  slug: string;
  description: string;
  category: string;
  venue: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  registrationDeadline: string;
  bannerUrl?: string;
  status: EventStatus;
  rejectionReason?: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    registrations: number;
    attendances: number;
  };
  userRegistration?: {
    id: string;
    status: RegistrationStatus;
    qrToken: string;
    waitlistPosition?: number;
  } | null;
}

export interface Registration {
  id: string;
  eventId: string;
  event: EventItem;
  userId: string;
  user: User;
  status: RegistrationStatus;
  qrToken: string;
  waitlistPosition?: number;
  registeredAt: string;
  cancelledAt?: string;
  attendance?: {
    id: string;
    markedAt: string;
    method: 'QR_SCAN' | 'MANUAL';
  };
}

export interface Certificate {
  id: string;
  certificateCode: string;
  eventId: string;
  event: {
    id: string;
    title: string;
    startDateTime: string;
    club: {
      name: string;
    };
  };
  userId: string;
  user: {
    id: string;
    name: string;
    rollNumber?: string;
    department?: string;
  };
  issueDate: string;
  pdfUrl?: string;
  verificationQrUrl?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
