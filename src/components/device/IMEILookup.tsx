import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDevices } from '@/data/mockDevices';
import { useSatDeskStore } from '@/stores/satDeskStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Smartphone, Building2, User, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export function IMEILookup() {
  const [isOpen, setIsOpen] = useState(false);
  const [imeiSearch, setImeiSearch] = useState('');
  const [foundDevice, setFoundDevice] = useState<any>(null);
  const navigate = useNavigate();
  const { satDesks } = useSatDeskStore();

  const handleSearch = () => {
    if (!imeiSearch.trim()) {
      toast({
        title: 'Enter IMEI',
        description: 'Please enter an IMEI number to search.',
        variant: 'destructive',
      });
      return;
    }

    const device = mockDevices.find((d) => d.imei.includes(imeiSearch.trim()));

    if (device) {
      setFoundDevice(device);
    } else {
      setFoundDevice(null);
      toast({
        title: 'Device Not Found',
        description: `No device found with IMEI: ${imeiSearch}`,
        variant: 'destructive',
      });
    }
  };

  const handleViewDevice = () => {
    if (foundDevice) {
      navigate(`/device/${foundDevice.id}`);
      setIsOpen(false);
      setFoundDevice(null);
      setImeiSearch('');
    }
  };

  const handleReset = () => {
    setImeiSearch('');
    setFoundDevice(null);
  };

  const getSatDeskName = (satDeskId: string) => {
    const satDesk = satDesks.find((sd) => sd.id === satDeskId);
    return satDesk?.name || 'Unknown';
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">IMEI Lookup</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              IMEI Lookup
            </DialogTitle>
            <DialogDescription>
              Enter the IMEI number to quickly find and manage a device
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter IMEI (e.g., 300434063472450)"
                value={imeiSearch}
                onChange={(e) => setImeiSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 font-mono"
              />
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {/* Search Results */}
            {foundDevice && (
              <div className="space-y-4 rounded-lg border-2 border-accent/20 bg-accent/5 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                      <Smartphone className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">{foundDevice.deviceName}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {foundDevice.imei}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={foundDevice.status} />
                </div>

                {/* Device Info */}
                <div className="space-y-3 rounded-lg border bg-background p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      SatDesk
                    </span>
                    <Badge variant="outline">
                      {getSatDeskName(foundDevice.satDeskId)}
                    </Badge>
                  </div>

                  {foundDevice.user && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        Current User
                      </span>
                      <span className="font-medium">
                        {foundDevice.user.firstName} {foundDevice.user.lastName}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Rental Period
                    </span>
                    <span className="font-medium">
                      {new Date(foundDevice.rentalStart).toLocaleDateString()} -{' '}
                      {new Date(foundDevice.rentalEnd).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={handleViewDevice} className="flex-1">
                    View & Manage Device
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    New Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
