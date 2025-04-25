// Serverless function for user login
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma with connection pooling for serverless
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// Helper function to sign JWT tokens
function sign(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('Login endpoint called with method:', req.method);
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    // Find user
    console.log('Finding user:', email);
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }
    
    // Verify password against passwordHash field
    console.log('Verifying password');
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }
    
    // Generate token
    console.log('Generating token');
    const token = sign(user.id);
    
    console.log('Login successful');
    res.json({ token });
  } catch (e) {
    console.error('Login error:', e);
    
    res.status(500).json({ 
      error: 'Login failed. Please try again later.'
    });
  } finally {
    // Clean up Prisma connection
    await prisma.$disconnect();
  }
} 