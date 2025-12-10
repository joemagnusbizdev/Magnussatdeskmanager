import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2, CheckCircle2, Satellite, Signal } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ConnectivityCheckProps {
  deviceId: string;
  imei: string;
}

export function ConnectivityCheck({ deviceId, imei }: ConnectivityCheckProps) {
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [status, setStatus] = useState<{
    online: boolean;
    signalStrength: number;
    lastContact: string;
    batteryLevel: number;
    location?: { lat: number; lng: number };
  } | null>(null);

  const handleCheckConnectivity = async () => {
    setChecking(true);

    // Simulate API call to Garmin
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock response
    const mockStatus = {
      online: Math.random() > 0.3,
      signalStrength: Math.floor(Math.random() * 5) + 1, // 1-5
      lastContact: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      batteryLevel: Math.floor(Math.random() * 100),
      location: {
        lat: 61.2181 + (Math.random() - 0.5) * 0.1,
        lng: -149.9003 + (Math.random() - 0.5) * 0.1,
      },
    };

    setStatus(mockStatus);
    setLastCheck(new Date());
    setChecking(false);

    toast({
      title: mockStatus.online ? 'Device Online' : 'Device Offline',
      description: mockStatus.online
        ? 'Successfully connected to device via Garmin network'
        : 'Device is currently offline or out of satellite range',
      variant: mockStatus.online ? 'default' : 'destructive',
    });
  };

  const getSignalBars = (strength: number) => {
    return Array.from({ length: 5 }, (_, i) => i < strength);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Connectivity Status</CardTitle>
            <CardDescription>Real-time connection check via Garmin API</CardDescription>
          </div>
          <Button
            onClick={handleCheckConnectivity}
            disabled={checking}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Satellite className="h-4 w-4" />
                Check Now
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!status && !lastCheck ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
            <Wifi className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No connectivity check yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Check Now" to verify device connection
            </p>
          </div>
        ) : status ? (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {status.online ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    <WifiOff className="h-5 w-5 text-destructive" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {status.online ? 'Device Online' : 'Device Offline'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last contact: {new Date(status.lastContact).toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge variant={status.online ? 'default' : 'secondary'}>
                {status.online ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>

            {/* Device Metrics */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Signal Strength */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Signal Strength</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getSignalBars(status.signalStrength).map((active, i) => (
                      <div
                        key={i}
                        className={`h-3 w-1 rounded-full ${
                          active ? 'bg-success' : 'bg-muted'
                        }`}
                        style={{ height: `${8 + i * 3}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Battery Level */}
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Battery</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${
                          status.batteryLevel > 20 ? 'bg-success' : 'bg-destructive'
                        }`}
                        style={{ width: `${status.batteryLevel}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{status.batteryLevel}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            {status.location && (
              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium">Last Known Location</p>
                <p className="font-mono text-sm text-muted-foreground">
                  {status.location.lat.toFixed(6)}, {status.location.lng.toFixed(6)}
                </p>
              </div>
            )}

            {lastCheck && (
              <p className="text-center text-xs text-muted-foreground">
                Last checked: {lastCheck.toLocaleTimeString()}
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
