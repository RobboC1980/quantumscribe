import { Router } from 'express';
import { login, register } from '../services/auth.service.js';
const router = Router();
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await register(email, password);
        res.json({ token });
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await login(email, password);
        res.json({ token });
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
export default router;
