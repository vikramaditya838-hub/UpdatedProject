import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { UPLOAD_DIR } from './middleware/upload.js';
import hotelRoutes from './routes/hotels.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Uploaded images are served from here; DB stores "/uploads/<file>"
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/hotels', hotelRoutes);

app.use('/api', (_req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller' : err.message;
    return res.status(400).json({ message });
  }
  if (err.status) return res.status(err.status).json({ message: err.message });

  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => console.log(`🚀 API running at http://localhost:${PORT}`));
