import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { prisma } from '../config/db.js';
const SALT_ROUNDS = 10;
export async function register(email, password) {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({ data: { email, password: hashed } });
    return sign(user.id);
}
export async function login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
        throw new Error('Invalid credentials');
    return sign(user.id);
}
function sign(userId) {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}
export function verify(token) {
    return jwt.verify(token, JWT_SECRET);
}
