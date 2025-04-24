import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export async function register(email: string, password: string) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { email, password: hashed } });
  return sign(user.id);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid credentials');
  return sign(user.id);
}

function sign(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verify(token: string) {
  return jwt.verify(token, JWT_SECRET) as { sub: string };
} 