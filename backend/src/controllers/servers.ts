import { Request, Response } from 'express';
import { PrismaClient, Protocol } from '@prisma/client';

const prisma = new PrismaClient({ url: process.env.DATABASE_URL });

// Get all active servers (for mobile app)
export const getActiveServers = async (req: Request, res: Response): Promise<void> => {
  try {
    const servers = await prisma.server.findMany({
      where: {
        isActive: true,
        isUnderMaintenance: false,
      },
      select: {
        id: true,
        name: true,
        location: true,
        flag: true,
        ipAddress: true,
        port: true,
        protocol: true,
        load: true,
        ping: true,
        configPayload: true,
      },
    });

    res.status(200).json({ servers });
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Get all servers (including inactive)
export const getAllServers = async (req: Request, res: Response): Promise<void> => {
  try {
    const servers = await prisma.server.findMany();
    res.status(200).json({ servers });
  } catch (error) {
    console.error('Error fetching all servers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Add a new server
export const createServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, flag, ipAddress, port, protocol, configPayload } = req.body;

    const server = await prisma.server.create({
      data: {
        name,
        location,
        flag,
        ipAddress,
        port,
        protocol: protocol || Protocol.HTTP_INJECTOR,
        configPayload,
      },
    });

    res.status(201).json({ message: 'Server created successfully', server });
  } catch (error) {
    console.error('Error creating server:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin: Update server status (maintenance, active)
export const updateServerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive, isUnderMaintenance } = req.body;

    const server = await prisma.server.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(isUnderMaintenance !== undefined && { isUnderMaintenance }),
      },
    });

    res.status(200).json({ message: 'Server status updated', server });
  } catch (error) {
    console.error('Error updating server:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
