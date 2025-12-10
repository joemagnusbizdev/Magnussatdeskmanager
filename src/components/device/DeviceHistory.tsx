import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, MapPin, Clock } from 'lucide-react';

interface HistoryEntry {
  id: string;
  date: string;
  event: 'rental_start' | 'rental_end' | 'user_assigned' | 'archived' | 'restored';
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  notes?: string;
}

interface DeviceHistoryProps {
  deviceId: string;
}

// Mock history data - in production this would come from your API
const mockHistory: Record<string, HistoryEntry[]> = {
  'dev-1': [
    {
      id: 'h-1',
      date: '2024-12-04T10:30:00Z',
      event: 'rental_start',
      user: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
      },
      notes: 'Device activated for Alaska expedition',
    },
    {
      id: 'h-2',
      date: '2024-11-15T14:00:00Z',
      event: 'user_assigned',
      user: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
      },
    },
  ],
  'dev-5': [
    {
      id: 'h-10',
      date: '2024-11-01T16:45:00Z',
      event: 'rental_end',
      user: {
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma.w@example.com',
      },
      notes: 'Device returned and archived',
    },
    {
      id: 'h-11',
      date: '2024-10-01T09:00:00Z',
      event: 'rental_start',
      user: {
        firstName: 'Emma',
        lastName: 'Wilson',
        email: 'emma.w@example.com',
      },
    },
  ],
};

const eventConfig = {
  rental_start: {
    label: 'Rental Started',
    color: 'bg-success',
    icon: Calendar,
  },
  rental_end: {
    label: 'Rental Ended',
    color: 'bg-muted-foreground',
    icon: Clock,
  },
  user_assigned: {
    label: 'User Assigned',
    color: 'bg-primary',
    icon: User,
  },
  archived: {
    label: 'Archived',
    color: 'bg-muted-foreground',
    icon: MapPin,
  },
  restored: {
    label: 'Restored',
    color: 'bg-accent',
    icon: MapPin,
  },
};

export function DeviceHistory({ deviceId }: DeviceHistoryProps) {
  const history = mockHistory[deviceId] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device History</CardTitle>
        <CardDescription>
          Timeline of rentals, assignments, and status changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
            <Clock className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No history available</p>
            <p className="text-sm text-muted-foreground">
              This device has no recorded history yet
            </p>
          </div>
        ) : (
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />

            {history.map((entry, index) => {
              const config = eventConfig[entry.event];
              const Icon = config.icon;

              return (
                <div key={entry.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background bg-background">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${config.color}`}>
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="rounded-lg border bg-card p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{config.label}</p>
                            <Badge variant="outline" className="text-xs">
                              {new Date(entry.date).toLocaleDateString()}
                            </Badge>
                          </div>
                          {entry.user && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {entry.user.firstName} {entry.user.lastName}
                            </p>
                          )}
                          {entry.notes && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
