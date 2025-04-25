import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { prisma } from '../config/db.js';

const router = Router();

// Get the current user's profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password in the response
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

// Update user's profile information
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate inputs
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Only update fields that were provided
    const updateData: any = {};
    if (email) updateData.email = email;

    // Only attempt update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user?.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    
    // Handle unique constraint violations (like email already in use)
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Email address is already in use' 
      });
    }
    
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router; 