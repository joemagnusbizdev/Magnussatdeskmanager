import { useState } from 'react';
import { Device } from '@/types/device';
import { useSatDeskStore } from '@/stores/satDeskStore';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DeviceHistory } from '@/components/device/DeviceHistory';
import { ConnectivityCheck } from '@/components/device/ConnectivityCheck';
import { QuickAssignmentDialog } from '@/components/device/QuickAssignmentDialog';
import { DeviceCleanupDialog } from '@/components/devices/DeviceCleanupDialog';
import { EditablePresetMessages } from '@/components/device/EditablePresetMessages';
import { DeviceHistoryView } from '@/components/device/DeviceHistoryView';
import { DefaultSOSContacts } from '@/components/device/DefaultSOSContacts';
import {
  User,
  Phone,
  Mail,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Edit,
  Archive as ArchiveIcon,
  Building2,
  UserPlus,
  Wifi,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DeviceDetailEnhancedProps {
  device: Device;
}

export function DeviceDetailEnhanced({ device }: DeviceDetailEnhancedProps) {
  const { satDesks } = useSatDeskStore();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [editingRental, setEditingRental] = useState(false);
  const [rentalData, setRentalData] = useState({
    rentalStart: device.rentalStart,
    rentalEnd: device.rentalEnd,
    notes: device.notes || '',
  });

  const satDesk = satDesks.find((sd) => sd.id === device.satDeskId);

  const handleAssignUser = (userData: any) => {
    // In production, this would call your API
    console.log('Assigning user:', userData);
    toast({
      title: 'User Assigned',
      description: `${userData.firstName} ${userData.lastName} has been assigned to ${device.deviceName}`,
    });
  };

  const handlePushToECC = () => {
    toast({
      title: 'Pushing to ECC',
      description: 'Device data is being synced to Emergency Command Center...',
    });
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Sync Complete',
        description: 'Device data successfully pushed to ECC',
      });
    }, 2000);
  };

  const handleArchive = () => {
    if (confirm(`Are you sure you want to archive ${device.deviceName}?`)) {
      toast({
        title: 'Device Archived',
        description: 'Device has been moved to archive and user data secured.',
      });
    }
  };

  const handleSaveRental = () => {
    // In production, this would call your API to update the rental details
    console.log('Updated rental data:', rentalData);
    toast({
      title: 'Rental Details Updated',
      description: 'Rental details have been successfully updated.',
    });
    setEditingRental(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1>{device.deviceName}</h1>
            <StatusBadge status={device.status} />
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            IMEI: {device.imei}
          </p>
          {satDesk && (
            <div className="mt-2 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">SatDesk:</span>
              <Badge variant="outline">
                {satDesk.number} - {satDesk.name}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {device.status !== 'archived' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssignDialogOpen(true)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {device.user ? 'Reassign User' : 'Assign User'}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Device
              </Button>
            </>
          )}
          {device.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleArchive}
              className="gap-2"
            >
              <ArchiveIcon className="h-4 w-4" />
              Archive
            </Button>
          )}
          {device.status === 'archived' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCleanupDialogOpen(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Cleanup
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {device.user ? (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="font-semibold">
                    {device.user.firstName} {device.user.lastName}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                    <p className="text-sm">
                      {new Date(device.user.dateOfBirth).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID/Passport #</p>
                    <p className="text-sm font-mono">{device.user.idPassport}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      <Mail className="mr-1 inline h-3 w-3" /> Email
                    </p>
                    <p className="text-sm">{device.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      <Phone className="mr-1 inline h-3 w-3" /> Phone
                    </p>
                    <p className="text-sm">{device.user.phone}</p>
                  </div>
                </div>
                {device.user.emergencyContacts && device.user.emergencyContacts.length > 0 && (
                  <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4 space-y-3">
                    <p className="text-sm font-medium text-destructive">
                      <AlertTriangle className="mr-1 inline h-4 w-4" /> Emergency Contacts
                    </p>
                    {device.user.emergencyContacts.map((contact) => (
                      <div key={contact.id} className="rounded bg-white/50 p-2">
                        <p className="font-semibold">
                          {contact.name}
                          {contact.relationship && (
                            <span className="ml-1 text-sm font-normal text-muted-foreground">
                              ({contact.relationship})
                            </span>
                          )}
                        </p>
                        <p className="text-sm">{contact.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 text-center">
                <User className="mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground">No user assigned</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAssignDialogOpen(true)}
                  className="mt-4 gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign User
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rental Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Rental Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingRental ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <Input
                      type="date"
                      value={rentalData.rentalStart}
                      onChange={(e) => setRentalData({ ...rentalData, rentalStart: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">End Date</p>
                    <Input
                      type="date"
                      value={rentalData.rentalEnd}
                      onChange={(e) => setRentalData({ ...rentalData, rentalEnd: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <Textarea
                    value={rentalData.notes}
                    onChange={(e) => setRentalData({ ...rentalData, notes: e.target.value })}
                    className="w-full"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRentalData({
                        rentalStart: device.rentalStart,
                        rentalEnd: device.rentalEnd,
                        notes: device.notes || '',
                      });
                      setEditingRental(false);
                    }}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveRental}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p className="font-semibold">
                      {new Date(device.rentalStart).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">End Date</p>
                    <p className="font-semibold">
                      {new Date(device.rentalEnd).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                {device.garminLogin && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Garmin Explore Login
                    </p>
                    <p className="font-mono text-sm">{device.garminLogin}</p>
                  </div>
                )}
                {device.lastContact && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Contact</p>
                    <p className="text-sm">
                      {new Date(device.lastContact).toLocaleString()}
                    </p>
                  </div>
                )}
                {device.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <p className="rounded-lg bg-muted p-3 text-sm">{device.notes}</p>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRental(true)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Preset Messages - Editable */}
        <EditablePresetMessages
          messages={device.presetMessages}
          onUpdate={(updatedMessages) => {
            // In production, this would call your API to update the device
            console.log('Updated messages:', updatedMessages);
          }}
        />

        {/* Default SOS Contacts */}
        <DefaultSOSContacts />

        {/* Device History with Location and Messages */}
        <div className="lg:col-span-2">
          <DeviceHistoryView
            deviceId={device.id}
            deviceName={device.deviceName}
          />
        </div>

        {/* Connectivity Check */}
        <ConnectivityCheck deviceId={device.id} imei={device.imei} />

        {/* Device History (Old - can be removed if not needed) */}
        <DeviceHistory deviceId={device.id} />
      </div>

      {/* Quick Assignment Dialog */}
      <QuickAssignmentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        deviceName={device.deviceName}
        currentUser={device.user}
        onAssign={handleAssignUser}
      />

      {/* Device Cleanup Dialog */}
      <DeviceCleanupDialog
        open={cleanupDialogOpen}
        onOpenChange={setCleanupDialogOpen}
        deviceName={device.deviceName}
        currentUser={device.user}
        onCleanupComplete={() => {
          toast({
            title: 'Device Cleaned',
            description: 'Device has been reset and is ready for reassignment.',
          });
          setCleanupDialogOpen(false);
        }}
        onArchivePreviousUser={() => {
          toast({
            title: 'User Archived',
            description: 'Previous user data has been securely archived.',
          });
        }}
      />
    </div>
  );
}