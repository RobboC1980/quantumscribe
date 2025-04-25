import { Router } from 'express';
import { requireAuth } from '@middleware/auth.middleware.js';
import * as epic from '@services/epic.service.js';
import * as story from '@services/story.service.js';
const r = Router();
r.use(requireAuth);
// GET /api/projects/:projectId/epics
r.get('/:projectId/epics', async (req, res) => {
    res.json(await epic.list(req.params.projectId));
});
// POST /api/projects/:projectId/epics
r.post('/:projectId/epics', async (req, res) => {
    const row = await epic.create(req.params.projectId, req.body.title);
    res.status(201).json(row);
});
// PATCH /api/epics/:id/status
r.patch('/epics/:id/status', async (req, res) => {
    res.json(await epic.updateStatus(req.params.id, req.body.status));
});
// DELETE /api/epics/:id
r.delete('/epics/:id', async (req, res) => {
    await epic.remove(req.params.id);
    res.status(204).end();
});
// ---------------- Stories ----------------
// POST /api/epics/:epicId/stories
r.post('/epics/:epicId/stories', async (req, res) => {
    const row = await story.create(req.params.epicId, req.body.title, req.body.position);
    res.status(201).json(row);
});
// PATCH /api/stories/:id/reorder
r.patch('/stories/:id/reorder', async (req, res) => {
    const { position, epicId } = req.body;
    res.json(await story.reorder(req.params.id, position, epicId));
});
// DELETE /api/stories/:id
r.delete('/stories/:id', async (req, res) => {
    await story.remove(req.params.id);
    res.status(204).end();
});
export default r;
