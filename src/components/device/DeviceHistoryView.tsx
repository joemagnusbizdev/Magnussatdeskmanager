import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MapPin,
  MessageSquare,
  Clock,
  Navigation,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface LocationPoint {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  battery?: number;
}

interface MessageRecord {
  id: string;
  timestamp: string;
  type: 'sent' | 'received' | 'sos' | 'ok';
  content: string;
  recipient?: string;
  status: 'delivered' | 'pending' | 'failed';
}

interface DeviceHistoryViewProps {
  deviceId: string;
  deviceName: string;
  locations?: LocationPoint[];
  messages?: MessageRecord[];
}

// Mock data for demonstration
const mockLocations: LocationPoint[] = [
  {
    id: 'loc-1',
    timestamp: '2024-12-04T14:30:00Z',
    latitude: 32.0853,
    longitude: 34.7818,
    altitude: 45,
    accuracy: 10,
    battery: 85,
  },
  {
    id: 'loc-2',
    timestamp: '2024-12-04T12:15:00Z',
    latitude: 32.0889,
    longitude: 34.7756,
    altitude: 52,
    accuracy: 8,
    battery: 92,
  },
  {
    id: 'loc-3',
    timestamp: '2024-12-04T10:00:00Z',
    latitude: 32.0923,
    longitude: 34.7701,
    altitude: 38,
    accuracy: 12,
    battery: 98,
  },
];

const mockMessages: MessageRecord[] = [
  {
    id: 'msg-1',
    timestamp: '2024-12-04T14:25:00Z',
    type: 'ok',
    content: 'All good, continuing as planned',
    recipient: 'MAGNUS ECC',
    status: 'delivered',
  },
  {
    id: 'msg-2',
    timestamp: '2024-12-04T12:10:00Z',
    type: 'sent',
    content: 'Setting up camp for the night',
    recipient: 'Emergency Contact',
    status: 'delivered',
  },
  {
    id: 'msg-3',
    timestamp: '2024-12-04T09:45:00Z',
    type: 'received',
    content: 'Have a safe trip! Check in tonight.',
    recipient: 'From: Emergency Contact',
    status: 'delivered',
  },
  {
    id: 'msg-4',
    timestamp: '2024-12-03T18:30:00Z',
    type: 'sent',
    content: 'Device activated and ready',
    recipient: 'MAGNUS ECC',
    status: 'delivered',
  },
];

export function DeviceHistoryView({
  deviceId,
  deviceName,
  locations = mockLocations,
  messages = mockMessages,
}: DeviceHistoryViewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExportLocations = () => {
    // In production, this would export to CSV/KML
    console.log('Exporting location history for', deviceId);
  };

  const handleExportMessages = () => {
    // In production, this would export to CSV
    console.log('Exporting message history for', deviceId);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getMessageTypeIcon = (type: MessageRecord['type']) => {
    switch (type) {
      case 'sos':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'sent':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'received':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
    }
  };

  const getMessageTypeBadge = (type: MessageRecord['type']) => {
    const variants = {
      sos: { label: 'SOS', className: 'bg-destructive text-destructive-foreground' },
      ok: { label: 'OK', className: 'bg-green-600 text-white' },
      sent: { label: 'Sent', className: 'bg-blue-600 text-white' },
      received: { label: 'Received', className: 'bg-purple-600 text-white' },
    };

    const config = variants[type];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Device History
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              Locations ({locations.length})
            </TabsTrigger>
          </TabsList>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Message history for {deviceName}
              </p>
              <Button size="sm" variant="outline" onClick={handleExportMessages} className="gap-2">
                <Download className="h-3 w-3" />
                Export
              </Button>
            </div>

            <ScrollArea className="h-[500px] rounded-lg border">
              <div className="space-y-3 p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/50" />
                    <p className="font-medium text-muted-foreground">No message history</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const { date, time } = formatTimestamp(message.timestamp);
                    return (
                      <div
                        key={message.id}
                        className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getMessageTypeIcon(message.type)}
                            {getMessageTypeBadge(message.type)}
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{date}</p>
                            <p>{time}</p>
                          </div>
                        </div>

                        <p className="mb-2 text-sm leading-relaxed">{message.content}</p>

                        <div className="flex items-center justify-between text-xs">
                          {message.recipient && (
                            <span className="text-muted-foreground">{message.recipient}</span>
                          )}
                          <Badge
                            variant="outline"
                            className={
                              message.status === 'delivered'
                                ? 'border-green-300 text-green-700'
                                : message.status === 'failed'
                                ? 'border-red-300 text-red-700'
                                : 'border-orange-300 text-orange-700'
                            }
                          >
                            {message.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Location history for {deviceName}
              </p>
              <Button size="sm" variant="outline" onClick={handleExportLocations} className="gap-2">
                <Download className="h-3 w-3" />
                Export
              </Button>
            </div>

            <ScrollArea className="h-[500px] rounded-lg border">
              <div className="space-y-3 p-4">
                {locations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MapPin className="mb-3 h-12 w-12 text-muted-foreground/50" />
                    <p className="font-medium text-muted-foreground">No location history</p>
                  </div>
                ) : (
                  locations.map((location, index) => {
                    const { date, time } = formatTimestamp(location.timestamp);
                    const isLatest = index === 0;

                    return (
                      <div
                        key={location.id}
                        className={`rounded-lg border p-4 shadow-sm transition-all hover:shadow-md ${
                          isLatest ? 'border-accent bg-accent/5' : 'bg-card'
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                isLatest
                                  ? 'bg-accent text-accent-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {isLatest && (
                                  <Badge className="mr-2 bg-gradient-to-r from-primary to-accent">
                                    Latest
                                  </Badge>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {date} at {time}
                              </p>
                            </div>
                          </div>
                          {location.battery !== undefined && (
                            <Badge variant="outline" className="gap-1">
                              {location.battery}%
                            </Badge>
                          )}
                        </div>

                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                          <div>
                            <p className="font-medium text-muted-foreground">Coordinates</p>
                            <p className="font-mono text-xs">
                              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                            </p>
                          </div>
                          {location.altitude !== undefined && (
                            <div>
                              <p className="font-medium text-muted-foreground">Altitude</p>
                              <p className="font-mono text-xs">{location.altitude}m</p>
                            </div>
                          )}
                          {location.accuracy !== undefined && (
                            <div>
                              <p className="font-medium text-muted-foreground">Accuracy</p>
                              <p className="font-mono text-xs">±{location.accuracy}m</p>
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3 w-full gap-2"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                              '_blank'
                            )
                          }
                        >
                          <Navigation className="h-3 w-3" />
                          View on Map
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
