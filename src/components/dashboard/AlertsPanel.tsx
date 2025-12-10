import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlertStore, Alert } from '@/stores/alertStore';
import { Bell, X, AlertCircle, AlertTriangle, Info, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AlertsPanel() {
  const navigate = useNavigate();
  const { alerts, generateAlerts, dismissAlert, dismissAllAlerts, getActiveAlerts } = useAlertStore();
  const activeAlerts = getActiveAlerts();

  // Generate alerts on mount and periodically
  useEffect(() => {
    generateAlerts();
    const interval = setInterval(generateAlerts, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [generateAlerts]);

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'info':
        return 'bg-blue-500';
    }
  };

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
    }
  };

  const handleAlertClick = (alert: Alert) => {
    if (alert.deviceId) {
      navigate(`/device/${alert.deviceId}`);
    } else if (alert.orderId) {
      navigate('/orders');
    } else if (alert.type === 'order-pending') {
      navigate('/orders');
    } else if (alert.type === 'low-inventory') {
      navigate('/devices');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-purple-100">
          <Bell className="h-5 w-5" />
          {activeAlerts.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold">Notifications</h3>
            {activeAlerts.length > 0 && (
              <Badge variant="secondary">{activeAlerts.length}</Badge>
            )}
          </div>
          {activeAlerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissAllAlerts}
              className="h-8 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {activeAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="font-semibold text-foreground">All caught up!</p>
              <p className="mt-1 text-sm text-muted-foreground">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="group relative flex gap-3 p-4 transition-colors hover:bg-purple-50/50"
                >
                  <div className={`mt-1 rounded-full p-1.5 ${getSeverityColor(alert.severity)} text-white`}>
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleAlertClick(alert)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{alert.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissAlert(alert.id);
                    }}
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
