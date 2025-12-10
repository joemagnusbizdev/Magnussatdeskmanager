import { useState } from 'react';
import { useDeviceStore } from '@/stores/deviceStore';
import { useSatDeskStore } from '@/stores/satDeskStore';
import { type DeviceUser } from '@/types/device';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner@2.0.3';
import { Users, FileUp, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BulkUserAssignmentProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BulkUserAssignment({ isOpen, onOpenChange }: BulkUserAssignmentProps) {
  const { devices, updateDevice } = useDeviceStore();
  const { satDesks, selectedSatDeskId } = useSatDeskStore();

  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [filterSatDesk, setFilterSatDesk] = useState<string>(selectedSatDeskId || 'all');
  const [userInfo, setUserInfo] = useState<DeviceUser>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    idPassport: '',
    email: '',
    phone: '',
  });

  // Filter devices based on selected satdesk
  const availableDevices = devices.filter((device) => {
    if (filterSatDesk === 'all') return true;
    return device.satDeskId === filterSatDesk;
  });

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDeviceIds((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const selectAll = () => {
    setSelectedDeviceIds(availableDevices.map((d) => d.id));
  };

  const deselectAll = () => {
    setSelectedDeviceIds([]);
  };

  const handleApplyToDevices = () => {
    // Validation
    if (selectedDeviceIds.length === 0) {
      toast.error('Please select at least one device');
      return;
    }

    if (!userInfo.firstName || !userInfo.lastName || !userInfo.email || !userInfo.phone) {
      toast.error('Please fill in all required user fields');
      return;
    }

    // Apply user info to all selected devices
    selectedDeviceIds.forEach((deviceId) => {
      updateDevice(deviceId, { user: userInfo });
    });

    toast.success('User information applied successfully!', {
      description: `Updated ${selectedDeviceIds.length} device(s)`,
    });

    // Reset form
    setSelectedDeviceIds([]);
    setUserInfo({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      idPassport: '',
      email: '',
      phone: '',
    });

    onOpenChange(false);
  };

  const handleImportCSV = () => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        
        // Parse CSV - expecting: firstName,lastName,email,phone,dateOfBirth,idPassport
        if (lines.length < 2) {
          toast.error('Invalid CSV file');
          return;
        }

        // Skip header and get first data row
        const data = lines[1].split(',').map((s) => s.trim());
        
        if (data.length >= 4) {
          setUserInfo({
            firstName: data[0] || '',
            lastName: data[1] || '',
            email: data[2] || '',
            phone: data[3] || '',
            dateOfBirth: data[4] || '',
            idPassport: data[5] || '',
          });
          
          toast.success('User data imported from CSV');
        } else {
          toast.error('Invalid CSV format. Expected: firstName,lastName,email,phone,dateOfBirth,idPassport');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk User Assignment
          </DialogTitle>
          <DialogDescription>
            Apply the same user information to multiple devices at once
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: User Information Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">User Information</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImportCSV}
                className="gap-2"
              >
                <FileUp className="h-4 w-4" />
                Import CSV
              </Button>
            </div>

            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="bulk-firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bulk-firstName"
                    value={userInfo.firstName}
                    onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bulk-lastName"
                    value={userInfo.lastName}
                    onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bulk-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bulk-email"
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bulk-phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="bulk-phone"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bulk-dob">Date of Birth</Label>
                <Input
                  id="bulk-dob"
                  type="date"
                  value={userInfo.dateOfBirth}
                  onChange={(e) => setUserInfo({ ...userInfo, dateOfBirth: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="bulk-id">ID/Passport Number</Label>
                <Input
                  id="bulk-id"
                  value={userInfo.idPassport}
                  onChange={(e) => setUserInfo({ ...userInfo, idPassport: e.target.value })}
                />
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200 p-3">
              <p className="text-sm text-blue-900">
                <strong>CSV Format:</strong> firstName, lastName, email, phone, dateOfBirth, idPassport
              </p>
            </Card>
          </div>

          {/* Right: Device Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Select Devices</h4>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
                  Clear
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="filter-satdesk">Filter by SatDesk</Label>
              <Select value={filterSatDesk} onValueChange={setFilterSatDesk}>
                <SelectTrigger id="filter-satdesk">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SatDesks</SelectItem>
                  {satDesks.map((desk) => (
                    <SelectItem key={desk.id} value={desk.id}>
                      {desk.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <ScrollArea className="h-[300px] rounded-md border p-3">
              <div className="space-y-2">
                {availableDevices.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No devices available in this SatDesk
                  </p>
                ) : (
                  availableDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 cursor-pointer"
                      onClick={() => toggleDeviceSelection(device.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedDeviceIds.includes(device.id)}
                          onCheckedChange={() => toggleDeviceSelection(device.id)}
                        />
                        <div>
                          <p className="font-medium text-sm">{device.deviceName}</p>
                          <p className="text-xs text-muted-foreground">IMEI: {device.imei}</p>
                        </div>
                      </div>
                      {device.user && (
                        <Badge variant="outline" className="text-xs">
                          Has User
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {selectedDeviceIds.length > 0 && (
              <Card className="bg-green-50 border-green-200 p-3">
                <div className="flex items-center gap-2 text-green-900">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {selectedDeviceIds.length} device(s) selected
                  </span>
                </div>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyToDevices}
            disabled={selectedDeviceIds.length === 0}
            className="bg-gradient-to-r from-primary to-accent"
          >
            Apply to {selectedDeviceIds.length} Device(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
