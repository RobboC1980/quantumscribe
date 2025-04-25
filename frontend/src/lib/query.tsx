import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const qc = new QueryClient();

// Create a component rather than just returning JSX
export const QueryProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={qc}>{children}</QueryClientProvider>
);

// Keep the withQuery function for backward compatibility
export const withQuery = (el: React.ReactNode) => (
  <QueryProvider>{el}</QueryProvider>
); 