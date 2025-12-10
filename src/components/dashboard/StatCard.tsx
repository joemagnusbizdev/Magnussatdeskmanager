import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  variant?: 'default' | 'accent' | 'success' | 'warning';
}

export function StatCard({ title, value, icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-6 transition-all duration-200 hover:shadow-lg animate-fade-in',
        variant === 'default' && 'bg-card border border-border',
        variant === 'accent' && 'gradient-hero text-primary-foreground',
        variant === 'success' && 'bg-success/10 border border-success/20',
        variant === 'warning' && 'bg-warning/10 border border-warning/20'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              'text-sm font-medium',
              variant === 'accent' ? 'text-primary-foreground/80' : 'text-muted-foreground'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'mt-2 text-3xl font-bold tracking-tight',
              variant === 'accent' && 'text-primary-foreground'
            )}
          >
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-xs',
                variant === 'accent' ? 'text-primary-foreground/70' : 'text-muted-foreground'
              )}
            >
              {trend}
            </p>
          )}
        </div>
        <div
          className={cn(
            'rounded-lg p-2.5',
            variant === 'default' && 'bg-muted',
            variant === 'accent' && 'bg-accent/20',
            variant === 'success' && 'bg-success/20',
            variant === 'warning' && 'bg-warning/20'
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
