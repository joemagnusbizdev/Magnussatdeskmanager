/**
 * Intelligent Inventory Manager
 * Real-time availability tracking with conflict prevention
 * Optimized for 25 SatDesk accounts
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  Calendar,
  Smartphone,
} from 'lucide-react';
import { useSatDeskStore } from '@/stores/satDeskStore';

interface InventoryStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  lowStock: boolean;
}

interface DeviceAvailability {
  deviceId: string;
  imei: string;
  deviceNumber: number;
  deviceName: string;
  satDeskId: string;
  status: 'available' | 'rented' | 'maintenance' | 'reserved';
  availableFrom?: string;
  nextRental?: {
    startDate: string;
    endDate: string;
    customerName: string;
  };
  condition: 'excellent' | 'good' | 'fair';
  lastMaintenance?: string;
  batteryHealth?: number;
}

interface InventoryManagerProps {
  devices: DeviceAvailability[];
  onAssignDevice?: (deviceId: string) => void;
  showSuggestions?: boolean;
}

export function InventoryManager({ 
  devices, 
  onAssignDevice,
  showSuggestions = false 
}: InventoryManagerProps) {
  const { satDesks, selectedSatDeskId } = useSatDeskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSatDesk, setFilterSatDesk] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Calculate inventory stats
  const stats = useMemo((): InventoryStats => {
    const filtered = selectedSatDeskId 
      ? devices.filter(d => d.satDeskId === selectedSatDeskId)
      : devices;

    const available = filtered.filter(d => d.status === 'available').length;
    const total = filtered.length;
    const threshold = Math.ceil(total * 0.2); // 20% threshold

    return {
      total,
      available,
      rented: filtered.filter(d => d.status === 'rented').length,
      maintenance: filtered.filter(d => d.status === 'maintenance').length,
      lowStock: available < threshold,
    };
  }, [devices, selectedSatDeskId]);

  // Filter devices
  const filteredDevices = useMemo(() => {
    let result = devices;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.imei.toLowerCase().includes(query) ||
        d.deviceName.toLowerCase().includes(query) ||
        d.deviceNumber.toString().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(d => d.status === filterStatus);
    }

    // SatDesk filter
    if (filterSatDesk !== 'all') {
      result = result.filter(d => d.satDeskId === filterSatDesk);
    } else if (selectedSatDeskId) {
      result = result.filter(d => d.satDeskId === selectedSatDeskId);
    }

    // Date range availability filter
    if (dateRange.start && dateRange.end) {
      result = result.filter(d => {
        if (d.status !== 'available') return false;
        if (!d.nextRental) return true;
        // Check if requested dates don't conflict with next rental
        return new Date(d.nextRental.startDate) > new Date(dateRange.end);
      });
    }

    return result;
  }, [devices, searchQuery, filterStatus, filterSatDesk, selectedSatDeskId, dateRange]);

  // Get suggested devices (best available)
  const suggestedDevices = useMemo(() => {
    if (!showSuggestions) return [];
    
    const available = filteredDevices.filter(d => d.status === 'available');
    
    // Sort by: condition (excellent first), battery health, last maintenance
    return available.sort((a, b) => {
      const conditionScore = { excellent: 3, good: 2, fair: 1 };
      const aScore = conditionScore[a.condition] + (a.batteryHealth || 0) / 100;
      const bScore = conditionScore[b.condition] + (b.batteryHealth || 0) / 100;
      return bScore - aScore;
    }).slice(0, 5);
  }, [filteredDevices, showSuggestions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-300';
      case 'rented': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'maintenance': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'reserved': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'excellent': return <Badge className="bg-green-600">Excellent</Badge>;
      case 'good': return <Badge className="bg-blue-600">Good</Badge>;
      case 'fair': return <Badge variant="secondary">Fair</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Inventory Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across {selectedSatDeskId ? '1 account' : `${satDesks.length} accounts`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.available / stats.total) * 100)}% availability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Rented</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.rented}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.rented / stats.total) * 100)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.maintenance}</div>
            <p className="text-xs text-muted-foreground">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Warning */}
      {stats.lowStock && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Inventory Alert</AlertTitle>
          <AlertDescription>
            Available devices are below 20% ({stats.available} of {stats.total}). 
            Consider ordering more or scheduling returns.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
          <CardDescription>Find available devices for your rental period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search IMEI, name, or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSatDesk} onValueChange={setFilterSatDesk}>
              <SelectTrigger>
                <SelectValue placeholder="All SatDesks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All SatDesks</SelectItem>
                {satDesks.map(desk => (
                  <SelectItem key={desk.id} value={desk.id}>
                    {desk.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setFilterSatDesk('all');
              setDateRange({ start: '', end: '' });
            }}>
              Clear Filters
            </Button>
          </div>

          {/* Date Range Filter */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Rental Start Date</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rental End Date</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Devices */}
      {showSuggestions && suggestedDevices.length > 0 && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Recommended Devices
            </CardTitle>
            <CardDescription>Best available devices based on condition and battery health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestedDevices.map(device => (
                <div 
                  key={device.deviceId}
                  className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                      <Smartphone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{device.deviceName}</div>
                      <div className="text-sm text-muted-foreground">
                        IMEI: {device.imei} • #{device.deviceNumber}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getConditionBadge(device.condition)}
                    {device.batteryHealth && (
                      <Badge variant="outline">{device.batteryHealth}% Battery</Badge>
                    )}
                    {onAssignDevice && (
                      <Button 
                        size="sm"
                        onClick={() => onAssignDevice(device.deviceId)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Device Inventory ({filteredDevices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredDevices.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No devices found matching your filters
              </div>
            ) : (
              filteredDevices.map(device => (
                <div
                  key={device.deviceId}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{device.deviceName}</div>
                      <div className="text-sm text-muted-foreground">
                        IMEI: {device.imei} • #{device.deviceNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(device.status)}>
                      {device.status}
                    </Badge>
                    
                    {device.nextRental && (
                      <div className="text-sm text-muted-foreground">
                        <Clock className="inline h-3 w-3 mr-1" />
                        Next: {new Date(device.nextRental.startDate).toLocaleDateString()}
                      </div>
                    )}

                    {getConditionBadge(device.condition)}

                    {onAssignDevice && device.status === 'available' && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => onAssignDevice(device.deviceId)}
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
