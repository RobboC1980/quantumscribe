import { chromium, Page } from '@playwright/test';
import fetch from 'node-fetch';
import { expect, test } from '@jest/globals';

const base = 'http://localhost:4000';

test('register + login returns 200', async () => {
  const email = `u${Date.now()}@test.io`;
  const password = 'Sup4base!';
  const reg = await fetch(`${base}/api/auth/register`, { 
    method: 'POST', 
    headers: { 'Content-Type':'application/json' }, 
    body: JSON.stringify({ email, password })
  });
  expect(reg.status).toBe(200);

  const login = await fetch(`${base}/api/auth/login`, { 
    method: 'POST', 
    headers: { 'Content-Type':'application/json' }, 
    body: JSON.stringify({ email, password })
  });
  expect(login.status).toBe(200);
  const { session } = await login.json();
  expect(session?.access_token).toBeDefined();
});

test('no -ms-high-contrast warning', async () => {
  const browser = await chromium.launch();
  const page: Page = await browser.newPage();
  page.on('console', msg => {
    if (msg.text().includes('-ms-high-contrast')) throw new Error('Deprecated CSS detected');
  });
  await page.goto('http://localhost:5173'); // vite dev port
  await browser.close();
}); 