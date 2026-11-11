import { prisma } from '../config/db.js';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../utils/errors.js';
import { parseAndVerifyQRToken } from '../utils/qr.js';
import { AttendanceMethod, RegistrationStatus } from '@prisma/client';

export class AttendanceService {
  async markAttendanceViaQR(markerId: string, eventId: string, qrToken: string) {
    const verified = parseAndVerifyQRToken(qrToken);

    if (!verified.isValid || !verified.registrationId || !verified.eventId || !verified.userId) {
      // Fallback: check if raw token matches in database
      const dbReg = await prisma.registration.findUnique({
        where: { qrToken },
        include: { user: true, event: true, attendance: true },
      });

      if (!dbReg) {
        throw new BadRequestError('Invalid or forged QR ticket token');
      }

      if (dbReg.eventId !== eventId) {
        throw new BadRequestError(`This ticket belongs to another event ('${dbReg.event.title}')`);
      }

      if (dbReg.status !== RegistrationStatus.CONFIRMED) {
        throw new BadRequestError(`Cannot check in: Registration status is ${dbReg.status}`);
      }

      if (dbReg.attendance) {
        throw new ConflictError(
          `Already checked in at ${new Date(dbReg.attendance.markedAt).toLocaleTimeString()}`
        );
      }

      const attendance = await prisma.attendance.create({
        data: {
          registrationId: dbReg.id,
          eventId,
          userId: dbReg.userId,
          markedById: markerId,
          method: AttendanceMethod.QR_SCAN,
        },
        include: {
          user: {
            select: { id: true, name: true, rollNumber: true, department: true, email: true },
          },
        },
      });

      return attendance;
    }

    if (verified.eventId !== eventId) {
      throw new BadRequestError('This QR ticket is for a different event');
    }

    const registration = await prisma.registration.findUnique({
      where: { id: verified.registrationId },
      include: {
        user: { select: { id: true, name: true, rollNumber: true, department: true, email: true } },
        attendance: true,
      },
    });

    if (!registration) {
      throw new NotFoundError('Registration ticket record not found');
    }

    if (registration.status !== RegistrationStatus.CONFIRMED) {
      throw new BadRequestError(`Registration is currently ${registration.status}`);
    }

    if (registration.attendance) {
      throw new ConflictError(
        `Already Checked In! Attendance was recorded at ${new Date(
          registration.attendance.markedAt
        ).toLocaleTimeString()}`
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        registrationId: registration.id,
        eventId,
        userId: registration.userId,
        markedById: markerId,
        method: AttendanceMethod.QR_SCAN,
      },
      include: {
        user: {
          select: { id: true, name: true, rollNumber: true, department: true, email: true },
        },
      },
    });

    return attendance;
  }

  async markAttendanceManual(markerId: string, eventId: string, identifier: string) {
    const trimmed = identifier.trim();

    // Find student by email or rollNumber
    const student = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: trimmed, mode: 'insensitive' } },
          { rollNumber: { equals: trimmed, mode: 'insensitive' } },
        ],
      },
    });

    if (!student) {
      throw new NotFoundError(`No student found with identifier: '${identifier}'`);
    }

    const registration = await prisma.registration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: student.id,
        },
      },
      include: { attendance: true },
    });

    if (!registration) {
      throw new NotFoundError(`${student.name} is not registered for this event`);
    }

    if (registration.status !== RegistrationStatus.CONFIRMED) {
      throw new BadRequestError(`Student registration is ${registration.status}`);
    }

    if (registration.attendance) {
      throw new ConflictError(
        `Attendance already recorded at ${new Date(
          registration.attendance.markedAt
        ).toLocaleTimeString()}`
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        registrationId: registration.id,
        eventId,
        userId: student.id,
        markedById: markerId,
        method: AttendanceMethod.MANUAL,
      },
      include: {
        user: {
          select: { id: true, name: true, rollNumber: true, department: true, email: true },
        },
      },
    });

    return attendance;
  }

  async getEventAttendees(eventId: string) {
    return prisma.attendance.findMany({
      where: { eventId },
      orderBy: { markedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            rollNumber: true,
            department: true,
          },
        },
        markedBy: {
          select: { name: true },
        },
      },
    });
  }

  async exportAttendeesCSV(eventId: string): Promise<string> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { title: true },
    });

    const attendees = await this.getEventAttendees(eventId);

    const headers = ['Student Name', 'Roll Number', 'Email', 'Department', 'Checked-in At', 'Method', 'Verified By'];
    const rows = attendees.map((a) => [
      `"${a.user.name}"`,
      `"${a.user.rollNumber || 'N/A'}"`,
      `"${a.user.email}"`,
      `"${a.user.department || 'N/A'}"`,
      `"${new Date(a.markedAt).toISOString()}"`,
      `"${a.method}"`,
      `"${a.markedBy.name}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const attendanceService = new AttendanceService();
