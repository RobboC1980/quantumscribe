import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const qc = new QueryClient();
export const withQuery = (el: React.ReactNode) => (
  <QueryClientProvider client={qc}>{el}</QueryClientProvider>
); 