import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWebhookStore } from '@/stores/webhookStore';
import {
  Webhook,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  AlertCircle,
  Activity,
  Zap,
  ShoppingCart,
  Satellite,
} from 'lucide-react';
import { format } from 'date-fns';

export default function WebhookMonitor() {
  const { events, getEvents, retryEvent } = useWebhookStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSource = sourceFilter === 'all' || event.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

    return matchesSearch && matchesSource && matchesStatus;
  });

  const selectedEventData = selectedEvent ? events.find(e => e.id === selectedEvent) : null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'received':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'garmin':
        return <Satellite className="h-4 w-4" />;
      case 'ecommerce':
        return <ShoppingCart className="h-4 w-4" />;
      case 'ecc':
        return <Activity className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      garmin: 'bg-blue-100 text-blue-700 border-blue-300',
      ecommerce: 'bg-purple-100 text-purple-700 border-purple-300',
      ecc: 'bg-green-100 text-green-700 border-green-300',
    };
    return colors[source] || 'bg-gray-100 text-gray-700';
  };

  const handleRetry = (eventId: string) => {
    retryEvent(eventId);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredEvents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `webhook-events-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
              <Webhook className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl">Webhook Monitor</h1>
              <p className="text-sm text-muted-foreground">
                Real-time webhook event tracking and debugging
              </p>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Events
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search event type, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="garmin">Garmin</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="ecc">ECC</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-semibold">{filteredEvents.length}</p>
                </div>
                <Webhook className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processed</p>
                  <p className="text-2xl font-semibold text-success">
                    {filteredEvents.filter(e => e.status === 'processed').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-semibold text-destructive">
                    {filteredEvents.filter(e => e.status === 'failed').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-semibold">
                    {Math.round(
                      filteredEvents
                        .filter(e => e.responseTime)
                        .reduce((acc, e) => acc + (e.responseTime || 0), 0) /
                        filteredEvents.filter(e => e.responseTime).length || 0
                    )}ms
                  </p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Webhook Events</CardTitle>
              <CardDescription>Recent webhook events received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedEvent === event.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-border hover:border-purple-300 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(event.status)}
                          <p className="font-medium truncate">{event.eventType}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            {getSourceIcon(event.source)}
                            <span className="capitalize">{event.source}</span>
                          </div>
                          <span>•</span>
                          <span>{format(event.timestamp, 'MMM dd, HH:mm:ss')}</span>
                          {event.responseTime && (
                            <>
                              <span>•</span>
                              <span>{event.responseTime}ms</span>
                            </>
                          )}
                        </div>
                        {event.retryCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry {event.retryCount}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className={getSourceColor(event.source)}>
                        {event.source}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredEvents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Webhook className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No webhook events found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Detailed webhook payload and metadata</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEventData ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    {getStatusIcon(selectedEventData.status)}
                    <div className="flex-1">
                      <p className="font-medium">{selectedEventData.eventType}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedEventData.timestamp, 'MMMM dd, yyyy • HH:mm:ss')}
                      </p>
                    </div>
                    <Badge variant="outline" className={getSourceColor(selectedEventData.source)}>
                      {selectedEventData.source}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Event ID</p>
                      <p className="text-xs text-muted-foreground font-mono">{selectedEventData.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedEventData.status)}
                        <span className="text-sm capitalize">{selectedEventData.status}</span>
                      </div>
                    </div>
                  </div>

                  {selectedEventData.responseStatus && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Response Status</p>
                        <Badge
                          variant={selectedEventData.responseStatus === 200 ? 'default' : 'destructive'}
                        >
                          {selectedEventData.responseStatus}
                        </Badge>
                      </div>
                      {selectedEventData.responseTime && (
                        <div>
                          <p className="text-sm font-medium mb-1">Response Time</p>
                          <p className="text-sm text-muted-foreground">{selectedEventData.responseTime}ms</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedEventData.retryCount > 0 && (
                    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-yellow-700" />
                        <p className="text-sm font-medium text-yellow-900">Retry Information</p>
                      </div>
                      <p className="text-sm text-yellow-700">
                        This event has been retried {selectedEventData.retryCount} time(s)
                      </p>
                    </div>
                  )}

                  {selectedEventData.errorMessage && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm font-medium text-destructive mb-1">Error Message</p>
                      <p className="text-sm text-destructive/80">{selectedEventData.errorMessage}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-2">Payload</p>
                    <div className="p-3 rounded-lg bg-muted max-h-80 overflow-y-auto">
                      <pre className="text-xs">
                        {JSON.stringify(selectedEventData.payload, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {selectedEventData.status === 'failed' && (
                    <Button
                      onClick={() => handleRetry(selectedEventData.id)}
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry Event
                    </Button>
                  )}

                  {selectedEventData.processedAt && (
                    <div>
                      <p className="text-sm font-medium mb-1">Processed At</p>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedEventData.processedAt, 'MMMM dd, yyyy • HH:mm:ss')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Webhook className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Select an event to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
