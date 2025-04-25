import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'antd/dist/reset.css';
import { QueryProvider } from './lib/query';

import Dashboard from './routes/Dashboard';
import Login from './routes/Login';
import Projects from './routes/Projects';
import Kanban from './routes/Kanban';
import Billing from './routes/Billing';
import AiAssistant from './routes/AiAssistant';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId/board" element={<Kanban />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/ai" element={<AiAssistant />} />
          <Route path="/*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  </React.StrictMode>
);
