import { verify } from '../services/auth.service.js';
/**
 * Authentication middleware that validates JWT tokens from the Authorization header
 */
export function authenticate(req, res, next) {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Authentication token is required' });
    }
    try {
        // Verify the token and extract user ID
        const decoded = verify(token);
        // Attach user to request for later use in route handlers
        req.user = { id: decoded.sub };
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Invalid authentication token' });
    }
}
