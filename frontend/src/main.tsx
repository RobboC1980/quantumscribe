import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'antd/dist/reset.css';

import Dashboard from './routes/Dashboard';
import Login from './routes/Login';
import Projects from './routes/Projects';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
