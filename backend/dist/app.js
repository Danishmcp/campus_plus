import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
// Route handlers
import authRoutes from './routes/auth.routes.js';
import clubRoutes from './routes/club.routes.js';
import eventRoutes from './routes/event.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
const app = express();
// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));
// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.',
    },
});
app.use(limiter);
// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'CampusPulse College Event & Club API',
        version: '1.0.0',
    });
});
// Mount API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clubs', clubRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/registrations', registrationRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/certificates', certificateRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
// Centralized error handler
app.use(errorHandler);
export default app;
