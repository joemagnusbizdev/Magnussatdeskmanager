import { useState } from 'react';
import { Device } from '@/types/device';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Filter,
} from 'lucide-react';

interface InventoryViewProps {
  devices: Device[];
  onSelectDevice?: (device: Device) => void;
  selectedDeviceId?: string;
}

export function InventoryView({ devices, onSelectDevice, selectedDeviceId }: InventoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ready' | 'needs-cleanup'>('all');

  // Filter available devices (not in field)
  const availableDevices = devices.filter((device) => 
    device.status === 'inactive' || device.status === 'available' || device.status === 'archived'
  );

  // Further filter by search and type
  const filteredDevices = availableDevices.filter((device) => {
    const matchesSearch =
      device.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.imei.includes(searchQuery);

    const matchesType =
      filterType === 'all' ||
      (filterType === 'ready' && device.status === 'available') ||
      (filterType === 'needs-cleanup' && (device.status === 'archived' || device.user));

    return matchesSearch && matchesType;
  });

  const readyCount = availableDevices.filter((d) => d.status === 'available' && !d.user).length;
  const needsCleanupCount = availableDevices.filter(
    (d) => d.status === 'archived' || d.user
  ).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            Available Inventory
          </div>
          <Badge variant="outline" className="gap-1">
            {availableDevices.length} devices
          </Badge>
        </CardTitle>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or IMEI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All ({availableDevices.length})
            </Button>
            <Button
              variant={filterType === 'ready' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('ready')}
              className="gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Ready ({readyCount})
            </Button>
            <Button
              variant={filterType === 'needs-cleanup' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('needs-cleanup')}
              className="gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              Cleanup ({needsCleanupCount})
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredDevices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
            <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">
              {searchQuery
                ? 'No devices found matching your search'
                : 'No available devices in inventory'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDevices.map((device) => {
              const needsCleanup = device.status === 'archived' || device.user;
              const isSelected = selectedDeviceId === device.id;

              return (
                <div
                  key={device.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-all hover:border-accent hover:shadow-md ${
                    isSelected ? 'border-accent bg-accent/5 shadow-md' : ''
                  } ${needsCleanup ? 'border-orange-200 bg-orange-50/50' : ''}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        needsCleanup
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Smartphone className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{device.deviceName}</p>
                        {isSelected && (
                          <Badge className="gap-1 bg-gradient-to-r from-primary to-accent">
                            <CheckCircle2 className="h-3 w-3" />
                            Selected
                          </Badge>
                        )}
                        {needsCleanup && (
                          <Badge variant="outline" className="gap-1 border-orange-300 text-orange-700">
                            <AlertCircle className="h-3 w-3" />
                            Needs Cleanup
                          </Badge>
                        )}
                        {!needsCleanup && device.status === 'available' && (
                          <Badge variant="outline" className="gap-1 border-green-300 text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Ready
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono text-sm text-muted-foreground">
                        IMEI: {device.imei}
                      </p>
                      {device.user && (
                        <p className="text-sm text-orange-600">
                          Previous: {device.user.firstName} {device.user.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {onSelectDevice && (
                    <Button
                      size="sm"
                      variant={isSelected ? 'outline' : 'default'}
                      onClick={() => onSelectDevice(device)}
                      disabled={isSelected}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
