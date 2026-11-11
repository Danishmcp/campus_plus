import QRCode from 'qrcode';
import crypto from 'crypto';
import { env } from '../config/env.js';
export function createSignedQRToken(payload) {
    const data = `${payload.registrationId}:${payload.eventId}:${payload.userId}`;
    const signature = crypto
        .createHmac('sha256', env.QR_SIGN_SECRET)
        .update(data)
        .digest('hex');
    return `CPQR.${Buffer.from(data).toString('base64url')}.${signature}`;
}
export function parseAndVerifyQRToken(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3 || parts[0] !== 'CPQR') {
            return { isValid: false };
        }
        const rawData = Buffer.from(parts[1], 'base64url').toString('utf8');
        const signature = parts[2];
        const expectedSignature = crypto
            .createHmac('sha256', env.QR_SIGN_SECRET)
            .update(rawData)
            .digest('hex');
        if (signature !== expectedSignature) {
            return { isValid: false };
        }
        const [registrationId, eventId, userId] = rawData.split(':');
        return {
            isValid: true,
            registrationId,
            eventId,
            userId,
        };
    }
    catch {
        return { isValid: false };
    }
}
export async function generateQRDataURL(text) {
    return QRCode.toDataURL(text, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
            dark: '#1e1b4b',
            light: '#ffffff',
        },
    });
}
