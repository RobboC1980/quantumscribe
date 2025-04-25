import { verify } from '../services/auth.service.js';
export function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
        return res.status(401).json({ error: 'Unauthenticated' });
    try {
        const payload = verify(header.split(' ')[1]);
        req.userId = payload.sub;
        next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
