import { Router } from 'express';
const router = Router();
router.get('/', (_req, res) => res.json([]));
router.post('/', (_req, res) => res.status(201).json({}));
router.get('/:id', (_req, res) => res.json({}));
router.put('/:id', (_req, res) => res.json({}));
router.delete('/:id', (_req, res) => res.status(204).send());
export default router;
