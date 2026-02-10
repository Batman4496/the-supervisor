import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import router from './lib/router';
import "./index.css";
import { ThemeProvider } from './providers/theme-provider';
import QueueProvider from './providers/queue-provider';
import ResourceProvider from './providers/resource-provider';
import LogProvider from './providers/log-provider';
import ToastProvider from './providers/toast-provider';
import { TooltipProvider } from './components/ui/tooltip';

const root = createRoot(document.body);

root.render(
  <TooltipProvider>
    <ToastProvider>
      <LogProvider>
        <ResourceProvider>
          <QueueProvider>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <RouterProvider router={router} />
            </ThemeProvider>
          </QueueProvider>
        </ResourceProvider>
      </LogProvider>
    </ToastProvider>
  </TooltipProvider>
);