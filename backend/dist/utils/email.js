import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
let transporter = null;
async function getTransporter() {
    if (transporter)
        return transporter;
    if (env.SMTP_USER && env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: env.SMTP_PORT === 465,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS,
            },
        });
    }
    else {
        // Generate test ethereal account if not configured
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log('Created Ethereal test mail transporter:', testAccount.user);
        }
        catch {
            // Fallback dummy transport
            transporter = nodemailer.createTransport({
                jsonTransport: true,
            });
        }
    }
    return transporter;
}
async function sendMail(options) {
    try {
        const mailer = await getTransporter();
        const info = await mailer.sendMail({
            from: env.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`✉️ Email preview available at: ${previewUrl}`);
        }
    }
    catch (err) {
        console.warn(`Could not dispatch email to ${options.to}:`, err.message);
    }
}
export const emailService = {
    async sendRegistrationEmail(to, data) {
        await sendMail({
            to,
            subject: `Registration Confirmed: ${data.eventTitle}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4338ca;">You're Registered for ${data.eventTitle}!</h2>
          <p>Hi ${data.name},</p>
          <p>Your registration is confirmed. Please present your digital QR ticket at the entrance for attendance check-in.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Venue:</strong> ${data.venue}</p>
            <p><strong>Date & Time:</strong> ${data.date}</p>
          </div>
          <p style="color: #64748b; font-size: 12px;">You can view and present your ticket on your CampusPulse dashboard.</p>
        </div>
      `,
        });
    },
    async sendWaitlistPromotionEmail(to, data) {
        await sendMail({
            to,
            subject: `Great news! You have been confirmed for ${data.eventTitle}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #059669;">Seat Confirmed From Waitlist!</h2>
          <p>Hi ${data.name},</p>
          <p>A seat has opened up for <strong>${data.eventTitle}</strong> and your registration has been automatically promoted from the waitlist to Confirmed!</p>
          <p>Your QR ticket is now active on your dashboard.</p>
        </div>
      `,
        });
    },
    async sendCertificateIssuedEmail(to, data) {
        await sendMail({
            to,
            subject: `Certificate of Participation: ${data.eventTitle}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4338ca;">Your Official Certificate is Ready</h2>
          <p>Hi ${data.name},</p>
          <p>Thank you for attending <strong>${data.eventTitle}</strong>. Your verifiable digital certificate of participation has been issued.</p>
          <p><strong>Certificate ID:</strong> ${data.certCode}</p>
          <p><a href="${data.verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">View & Verify Certificate</a></p>
        </div>
      `,
        });
    },
    async sendEventStatusUpdateEmail(to, data) {
        await sendMail({
            to,
            subject: `Event Moderation Update: ${data.eventTitle}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2>Event Status: ${data.status}</h2>
          <p>Hi ${data.organizerName},</p>
          <p>Your event proposal <strong>${data.eventTitle}</strong> has been updated to: <strong>${data.status}</strong>.</p>
          ${data.reason ? `<p><strong>Feedback:</strong> ${data.reason}</p>` : ''}
        </div>
      `,
        });
    },
};
