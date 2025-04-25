import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.middleware';

const r = Router();
const db = new PrismaClient();

// ✨ stream fresh metrics every 10 s (or when data mutates via NOTIFY, if you like)
r.get('/stream', requireAuth, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = async () => {
    const metrics = await collectMetrics();
    res.write(`data: ${JSON.stringify(metrics)}\n\n`);
  };

  await send();
  const iv = setInterval(send, 10_000);

  req.on('close', () => clearInterval(iv));
});

async function collectMetrics() {
  const [projectCount, bugCount] = await Promise.all([
    db.project.count(),
    db.story.count({ where: { type: 'BUG' } }),
  ]);

  // velocity: completed stories per week (last 8 w)
  const velocity = await db.$queryRaw<
    { w: string; done: number }[]
  >`SELECT to_char(date_trunc('week', "doneAt"), 'IW') as w,
        count(*) as done
     FROM "Story"
     WHERE "status"='DONE' AND "doneAt" > now() - interval '8 weeks'
     GROUP BY w ORDER BY w`;

  // status buckets
  const status = await db.story.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  return { projectCount, bugCount, velocity, status };
}

export default r; 