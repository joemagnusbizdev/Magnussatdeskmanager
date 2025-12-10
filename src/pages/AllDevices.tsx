import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DeviceTable } from '@/components/dashboard/DeviceTable';
import { mockDevices } from '@/data/mockDevices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Search, Filter, Archive, MapPin, Package } from 'lucide-react';
import { Device } from '@/types/device';
import { Badge } from '@/components/ui/badge';
import { useSatDeskStore } from '@/stores/satDeskStore';

export function AllDevices() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const { satDesks } = useSatDeskStore();

  // Filter devices based on search and status
  const filteredDevices = mockDevices.filter((device) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      device.deviceNumber.toString().includes(searchQuery) ||
      device.deviceName.toLowerCase().includes(searchLower) ||
      device.imei.toLowerCase().includes(searchLower) || // Supports partial IMEI matching
      device.user?.firstName.toLowerCase().includes(searchLower) ||
      device.user?.lastName.toLowerCase().includes(searchLower) ||
      device.user?.email.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: filteredDevices.length,
    active: filteredDevices.filter((d) => d.status === 'active').length,
    pending: filteredDevices.filter((d) => d.status === 'pending').length,
    archived: filteredDevices.filter((d) => d.status === 'archived').length,
  };

  const handleBulkArchive = () => {
    console.log('Archiving devices:', Array.from(selectedDevices));
    // TODO: Implement bulk archive
    setSelectedDevices(new Set());
  };

  const handleBulkSetLocation = (location: 'in' | 'out') => {
    console.log(`Setting location to ${location} for devices:`, Array.from(selectedDevices));
    // TODO: Implement bulk location update
    setSelectedDevices(new Set());
  };

  const handleBulkReassign = () => {
    console.log('Reassigning devices:', Array.from(selectedDevices));
    // TODO: Implement bulk SatDesk reassignment dialog
    setSelectedDevices(new Set());
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-purple-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text font-bold text-transparent">
                All Devices
              </h1>
              <p className="text-sm text-muted-foreground">
                Showing {filteredDevices.length} of {mockDevices.length} devices
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/new-rental')}
            className="bg-gradient-to-r from-primary to-accent font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Rental
          </Button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedDevices.size > 0 && (
          <div className="flex items-center justify-between rounded-lg border-2 border-purple-300 bg-purple-50 p-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-200 text-purple-900">
                {selectedDevices.size} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDevices(new Set())}
                className="h-8 text-xs"
              >
                Clear Selection
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkSetLocation('in')}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                Set to Inventory
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkSetLocation('out')}
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                Set to Field
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkReassign}
                className="gap-2"
              >
                Reassign SatDesk
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkArchive}
                className="gap-2"
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border-2 border-border/50 bg-white/70 p-4 backdrop-blur-sm">
            <p className="text-sm font-semibold text-muted-foreground">Total</p>
            <p className="mt-1 font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">Active</p>
            <p className="mt-1 font-bold text-emerald-900">{stats.active}</p>
          </div>
          <div className="rounded-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
            <p className="text-sm font-semibold text-orange-900">Pending</p>
            <p className="mt-1 font-bold text-orange-900">{stats.pending}</p>
          </div>
          <div className="rounded-lg border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <p className="text-sm font-semibold text-gray-700">Archived</p>
            <p className="mt-1 font-bold text-gray-700">{stats.archived}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by device #, IMEI, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 border-border/50 bg-white/70 pl-10 backdrop-blur-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-2 border-border/50 bg-white/70 backdrop-blur-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Devices Table */}
        {filteredDevices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-white/50 py-16 backdrop-blur-sm">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="font-semibold text-foreground">No devices found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <DeviceTable 
            devices={filteredDevices} 
            showAll 
            selectedDevices={selectedDevices}
            onSelectionChange={setSelectedDevices}
          />
        )}
      </div>
    </AppLayout>
  );
}