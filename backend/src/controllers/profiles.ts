import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ url: process.env.DATABASE_URL });

export const getUserProfiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const profiles = await prisma.profile.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ profiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { name, configData } = req.body;

    const profile = await prisma.profile.create({
      data: {
        name,
        configData,
        userId,
      },
    });

    res.status(201).json({ message: 'Profile created', profile });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { name, configData, isFavorite } = req.body;

    const existingProfile = await prisma.profile.findUnique({ where: { id } });
    if (!existingProfile || existingProfile.userId !== userId) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const profile = await prisma.profile.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(configData !== undefined && { configData }),
        ...(isFavorite !== undefined && { isFavorite }),
      },
    });

    res.status(200).json({ message: 'Profile updated', profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const existingProfile = await prisma.profile.findUnique({ where: { id } });
    if (!existingProfile || existingProfile.userId !== userId) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    await prisma.profile.delete({ where: { id } });
    res.status(200).json({ message: 'Profile deleted' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
