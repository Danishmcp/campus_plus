import app from './app.js';
import { connectDB } from './config/db.js';
import { initScheduledJobs } from './utils/cron.js';
import { env } from './config/env.js';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { fileURLToPath } from 'url';
// Only run server, cron, and local static uploads when NOT on Vercel
if (!process.env.VERCEL) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // Serve local uploads directory
    const uploadsDir = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use('/uploads', express.static(uploadsDir));
    const PORT = env.PORT || 5000;
    async function startServer() {
        await connectDB();
        initScheduledJobs();
        app.listen(PORT, () => {
            console.log(`🚀 CampusPulse API server listening on http://localhost:${PORT}`);
        });
    }
    startServer();
}
export default app;
