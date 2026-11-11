import cron from 'node-cron';
import { prisma } from '../config/db.js';
import { notificationService } from '../services/notification.service.js';
import { emailService } from './email.js';
import { EventStatus, RegistrationStatus, NotificationType } from '@prisma/client';

export function initScheduledJobs(): void {
  console.log('⏰ Initializing CampusPulse background scheduled jobs (node-cron)...');

  // 1. Run hourly: 24-Hour Event Reminder Job
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      // Find events starting in the 24-hour window
      const upcomingEvents = await prisma.event.findMany({
        where: {
          status: EventStatus.APPROVED,
          startDateTime: {
            gte: in23Hours,
            lte: in25Hours,
          },
        },
        include: {
          registrations: {
            where: { status: RegistrationStatus.CONFIRMED },
            include: { user: true },
          },
        },
      });

      for (const event of upcomingEvents) {
        for (const reg of event.registrations) {
          // Avoid duplicate reminder notifications
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: reg.userId,
              type: NotificationType.REMINDER,
              title: { contains: event.title },
            },
          });

          if (!existingNotification) {
            await notificationService.createNotification({
              userId: reg.userId,
              title: `Reminder: ${event.title} starts tomorrow!`,
              message: `Don't forget! "${event.title}" is happening at ${event.venue} on ${new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
              type: NotificationType.REMINDER,
              link: `/events/${event.slug}`,
            });

            await emailService.sendRegistrationEmail(reg.user.email, {
              name: reg.user.name,
              eventTitle: event.title,
              venue: event.venue,
              date: new Date(event.startDateTime).toLocaleString(),
            });
          }
        }
      }
    } catch (err) {
      console.error('Error executing 24h event reminder cron:', err);
    }
  });

  console.log('✅ Scheduled jobs successfully initialized.');
}
