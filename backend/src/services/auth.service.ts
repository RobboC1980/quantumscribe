import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { prisma } from '../config/db.js';

const SALT_ROUNDS = 10;

export async function register(email: string, password: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
  // Create user with correct field name mapping
  const user = await prisma.user.create({ 
    data: { 
      email, 
      passwordHash: hashedPassword, // This matches the field in our Prisma schema
    } 
  });
  
  return sign(user.id);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  
  // Compare with the passwordHash field from the schema
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');
  
  return sign(user.id);
}

function sign(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verify(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string };
} 