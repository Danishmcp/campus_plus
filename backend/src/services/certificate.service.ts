import { prisma } from '../config/db.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import { generateCertificatePDF } from '../utils/pdf.js';
import { generateQRDataURL } from '../utils/qr.js';
import { notificationService } from './notification.service.js';
import { emailService } from '../utils/email.js';
import { env } from '../config/env.js';
import { NotificationType } from '@prisma/client';
import crypto from 'crypto';

export class CertificateService {
  async issueCertificatesForEvent(issuerId: string, eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        club: { select: { name: true } },
      },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const issuer = await prisma.user.findUnique({
      where: { id: issuerId },
      select: { name: true },
    });

    // Fetch all attendees who checked in
    const attendees = await prisma.attendance.findMany({
      where: { eventId },
      include: {
        user: true,
      },
    });

    if (attendees.length === 0) {
      throw new BadRequestError('No verified attendees found for this event. Attendance must be marked before issuing certificates.');
    }

    const issuedCertificates = [];

    for (const attendee of attendees) {
      // Check if already issued
      const existing = await prisma.certificate.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId: attendee.userId,
          },
        },
      });

      if (existing) {
        issuedCertificates.push(existing);
        continue;
      }

      const certCode = `CERT-${event.title.slice(0, 3).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const verifyUrl = `${env.FRONTEND_URL}/verify/${certCode}`;

      // Generate PDF file
      const { pdfUrl } = await generateCertificatePDF({
        certificateCode: certCode,
        studentName: attendee.user.name,
        studentRollNumber: attendee.user.rollNumber,
        department: attendee.user.department,
        eventTitle: event.title,
        clubName: event.club.name,
        eventDate: new Date(event.startDateTime),
        issueDate: new Date(),
        issuerName: issuer?.name || 'Club Lead',
        verifyUrl,
      });

      // Generate verification QR image data url
      const verificationQrUrl = await generateQRDataURL(verifyUrl);

      const cert = await prisma.certificate.create({
        data: {
          certificateCode: certCode,
          eventId,
          userId: attendee.userId,
          issuedById: issuerId,
          pdfUrl,
          verificationQrUrl,
        },
      });

      issuedCertificates.push(cert);

      // In-app notification
      await notificationService.createNotification({
        userId: attendee.userId,
        title: 'Certificate Awarded!',
        message: `Your participation certificate for "${event.title}" has been issued. Download it now!`,
        type: NotificationType.CERTIFICATE,
        link: `/dashboard?tab=certificates`,
      });

      // Email dispatch
      await emailService.sendCertificateIssuedEmail(attendee.user.email, {
        name: attendee.user.name,
        eventTitle: event.title,
        certCode,
        verifyUrl,
      });
    }

    // Auto mark event as COMPLETED if not already
    if (event.status !== 'COMPLETED') {
      await prisma.event.update({
        where: { id: eventId },
        data: { status: 'COMPLETED' },
      });
    }

    return {
      message: `Issued ${issuedCertificates.length} certificates successfully.`,
      certificates: issuedCertificates,
    };
  }

  async getCertificateByCode(certificateCode: string) {
    const cert = await prisma.certificate.findUnique({
      where: { certificateCode: certificateCode.trim().toUpperCase() },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            venue: true,
            startDateTime: true,
            club: { select: { name: true, slug: true, logo: true } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            department: true,
            rollNumber: true,
          },
        },
        issuedBy: {
          select: { name: true },
        },
      },
    });

    if (!cert) {
      throw new NotFoundError(`Certificate '${certificateCode}' was not found in the official registry.`);
    }

    return cert;
  }

  async getUserCertificates(userId: string) {
    return prisma.certificate.findMany({
      where: { userId },
      orderBy: { issueDate: 'desc' },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            club: { select: { name: true, slug: true } },
          },
        },
        issuedBy: { select: { name: true } },
      },
    });
  }
}

export const certificateService = new CertificateService();
