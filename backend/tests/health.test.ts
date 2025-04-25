import request from 'supertest';
import app from '../src/app';

test('GET /api/projects responds 401 when unauthenticated', async () => {
  const res = await request(app).get('/api/projects');
  expect(res.statusCode).toBe(401);
}); 