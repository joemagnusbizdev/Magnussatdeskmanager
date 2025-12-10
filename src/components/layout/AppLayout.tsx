import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { ApiModeIndicator } from '@/components/common/ApiModeIndicator';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Top Bar with Alerts */}
        <div className="sticky top-0 z-10 border-b border-border/50 bg-white/80 backdrop-blur-sm">
          <div className="container flex h-16 items-center justify-between px-4 lg:px-8">
            <ApiModeIndicator />
            <AlertsPanel />
          </div>
        </div>
        
        <div className="container px-4 py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}