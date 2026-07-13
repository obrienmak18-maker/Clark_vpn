import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient({ url: process.env.DATABASE_URL });
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Clark VPN API is running' });
});

// Import routes (to be created)
import authRoutes from './routes/auth';
import serverRoutes from './routes/servers';
import profileRoutes from './routes/profiles';

app.use('/api/auth', authRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/profiles', profileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
