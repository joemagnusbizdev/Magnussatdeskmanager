import { cn } from '@/lib/utils';
import { DeviceStatus } from '@/types/device';

interface StatusBadgeProps {
  status: DeviceStatus;
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-success/15 text-success border-success/30',
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  archived: {
    label: 'Archived',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      <span
        className={cn(
          'mr-1.5 h-1.5 w-1.5 rounded-full',
          status === 'active' && 'bg-success animate-pulse-subtle',
          status === 'pending' && 'bg-warning',
          status === 'archived' && 'bg-muted-foreground'
        )}
      />
      {config.label}
    </span>
  );
}
