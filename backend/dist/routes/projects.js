import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import * as svc from '../services/project.service';
const r = Router();
r.use(requireAuth);
// GET /api/projects
r.get('/', async (req, res) => {
    const rows = await svc.list(req.userId);
    res.json(rows);
});
// POST /api/projects
r.post('/', async (req, res) => {
    const row = await svc.create(req.userId, req.body);
    res.status(201).json(row);
});
// PUT /api/projects/:id
r.put('/:id', async (req, res) => {
    const row = await svc.update(req.params.id, req.userId, req.body);
    res.json(row);
});
// DELETE /api/projects/:id
r.delete('/:id', async (req, res) => {
    await svc.remove(req.params.id, req.userId);
    res.status(204).end();
});
export default r;
