import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockDevices } from '@/data/mockDevices';
import { useSatDeskStore } from '@/stores/satDeskStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Archive as ArchiveIcon, Search, RotateCcw, Eye, Trash2, Download, Lock } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { cn } from '@/lib/utils';

export default function Archive() {
  const { satDesks } = useSatDeskStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSatDesk, setSelectedSatDesk] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Filter archived devices
  const archivedDevices = mockDevices.filter((device) => device.status === 'archived');

  // Apply filters
  const filteredDevices = useMemo(() => {
    return archivedDevices.filter((device) => {
      const matchesSearch =
        searchQuery === '' ||
        device.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.imei.includes(searchQuery) ||
        device.user?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.user?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.user?.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSatDesk =
        selectedSatDesk === 'all' || device.satDeskId === selectedSatDesk;

      return matchesSearch && matchesSatDesk;
    });
  }, [archivedDevices, searchQuery, selectedSatDesk]);

  const handleViewDetails = (device: any) => {
    setSelectedDevice(device);
    setIsDetailDialogOpen(true);
  };

  const handleRestore = (device: any) => {
    if (
      confirm(
        `Are you sure you want to restore ${device.deviceName}? This will make the device available for new rentals.`
      )
    ) {
      toast({
        title: 'Device Restored',
        description: `${device.deviceName} has been restored and is now available.`,
      });
      setIsDetailDialogOpen(false);
    }
  };

  const handlePermanentDelete = (device: any) => {
    if (
      confirm(
        `⚠️ WARNING: This will permanently delete all data for ${device.deviceName}. This action cannot be undone. Are you absolutely sure?`
      )
    ) {
      toast({
        title: 'Device Data Deleted',
        description: `All data for ${device.deviceName} has been permanently removed.`,
        variant: 'destructive',
      });
      setIsDetailDialogOpen(false);
    }
  };

  const handleExportData = (device: any) => {
    // Simulate data export
    const exportData = {
      device: device.deviceName,
      imei: device.imei,
      user: device.user,
      rentalPeriod: {
        start: device.rentalStart,
        end: device.rentalEnd,
      },
      presetMessages: device.presetMessages,
      notes: device.notes,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${device.imei}_archive_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    toast({
      title: 'Data Exported',
      description: 'Archived rental data has been downloaded.',
    });
  };

  const getSatDeskName = (satDeskId: string) => {
    const satDesk = satDesks.find((sd) => sd.id === satDeskId);
    return satDesk?.name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateRentalDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
            <ArchiveIcon className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl">Archive</h1>
            <p className="text-sm text-muted-foreground">
              Securely stored rental records and user data from completed rentals
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Archived</CardDescription>
              <CardTitle className="text-3xl">{archivedDevices.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Completed rentals</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Data Retention</CardDescription>
              <CardTitle className="text-3xl">365</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Days before auto-purge</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Security</CardDescription>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Lock className="h-6 w-6 text-success" />
                AES-256
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Encrypted at rest</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find archived rentals by device, user, or date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by device, IMEI, or customer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSatDesk} onValueChange={setSelectedSatDesk}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filter by SatDesk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SatDesks</SelectItem>
                  {satDesks.map((satDesk) => (
                    <SelectItem key={satDesk.id} value={satDesk.id}>
                      {satDesk.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Archived Devices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Archived Rentals</CardTitle>
            <CardDescription>
              {filteredDevices.length} of {archivedDevices.length} archived rentals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>SatDesk</TableHead>
                  <TableHead>Rental Period</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchQuery || selectedSatDesk !== 'all'
                        ? 'No archived rentals match your filters.'
                        : 'No archived rentals yet.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{device.deviceName}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {device.imei}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {device.user ? (
                          <div>
                            <p className="font-medium">
                              {device.user.firstName} {device.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {device.user.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No user assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getSatDeskName(device.satDeskId)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(device.rentalStart)}</p>
                          <p className="text-muted-foreground">to {formatDate(device.rentalEnd)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {calculateRentalDuration(device.rentalStart, device.rentalEnd)} days
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={device.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(device)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleExportData(device)}
                            title="Export data"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Archived Rental Details</DialogTitle>
              <DialogDescription>
                Complete rental information for {selectedDevice?.deviceName}
              </DialogDescription>
            </DialogHeader>
            {selectedDevice && (
              <div className="space-y-6">
                {/* Device Info */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 font-semibold">Device Information</h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Device Name:</span>
                      <span className="font-medium">{selectedDevice.deviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IMEI:</span>
                      <span className="font-mono">{selectedDevice.imei}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SatDesk:</span>
                      <Badge variant="outline">
                        {getSatDeskName(selectedDevice.satDeskId)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Garmin Login:</span>
                      <span className="font-mono">{selectedDevice.garminLogin || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                {selectedDevice.user && (
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-3 font-semibold">Customer Information</h3>
                    <div className="grid gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">
                          {selectedDevice.user.firstName} {selectedDevice.user.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{selectedDevice.user.email}</span>
                      </div>
                      {selectedDevice.user.phone && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{selectedDevice.user.phone}</span>
                        </div>
                      )}
                      {selectedDevice.user.emergencyContact && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Emergency Contact:</span>
                            <span>{selectedDevice.user.emergencyContact}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Emergency Phone:</span>
                            <span>{selectedDevice.user.emergencyPhone}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Rental Period */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-3 font-semibold">Rental Period</h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span>{formatDate(selectedDevice.rentalStart)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">End Date:</span>
                      <span>{formatDate(selectedDevice.rentalEnd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>
                        {calculateRentalDuration(
                          selectedDevice.rentalStart,
                          selectedDevice.rentalEnd
                        )}{' '}
                        days
                      </span>
                    </div>
                    {selectedDevice.lastContact && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Contact:</span>
                        <span>{new Date(selectedDevice.lastContact).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preset Messages */}
                {selectedDevice.presetMessages.length > 0 && (
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-3 font-semibold">Preset Messages</h3>
                    <div className="space-y-2">
                      {selectedDevice.presetMessages.map((pm: any) => (
                        <div
                          key={pm.id}
                          className="flex items-start gap-3 rounded-lg bg-muted p-3"
                        >
                          <Badge variant="outline" className="mt-0.5">
                            {pm.slot}
                          </Badge>
                          <p className="text-sm">{pm.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedDevice.notes && (
                  <div className="rounded-lg border p-4">
                    <h3 className="mb-3 font-semibold">Notes</h3>
                    <p className="text-sm text-muted-foreground">{selectedDevice.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                variant="destructive"
                onClick={() => handlePermanentDelete(selectedDevice)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Permanent Delete
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExportData(selectedDevice)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button onClick={() => handleRestore(selectedDevice)} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Restore
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
