// Serverless function for user registration
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

const SALT_ROUNDS = 10;
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
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('Register endpoint called with method:', req.method);
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    if (password.length < 6) {
      console.log('Password too short');
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }
    
    // Check if user already exists
    console.log('Checking if user exists:', email);
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existingUser) {
      console.log('User already exists');
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    console.log('Hashing password');
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create user with correct field name (passwordHash)
    console.log('Creating user');
    const user = await prisma.user.create({ 
      data: { 
        email, 
        passwordHash: hashedPassword // This is the field name in our Prisma schema
      } 
    });
    
    // Generate token
    console.log('Generating token');
    const token = sign(user.id);
    
    console.log('Registration successful');
    res.status(201).json({ token });
  } catch (e) {
    console.error('Registration error:', e);
    
    res.status(500).json({ 
      error: 'Registration failed. Please try again later.' 
    });
  } finally {
    // Clean up Prisma connection
    await prisma.$disconnect();
  }
} 