import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle2,
  User,
  MessageSquare,
  Users,
  Archive,
  Trash2,
  Shield,
} from 'lucide-react';

interface DeviceCleanupDialogProps {
  isOpen?: boolean;
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  deviceName: string;
  previousUser?: {
    name: string;
    email: string;
  };
  currentUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onConfirm?: () => void;
  onCleanupComplete?: () => void;
  onArchive?: () => void;
  onArchivePreviousUser?: () => void;
}

export function DeviceCleanupDialog({
  isOpen,
  open,
  onOpenChange,
  deviceName,
  previousUser,
  currentUser,
  onConfirm,
  onCleanupComplete,
  onArchive,
  onArchivePreviousUser,
}: DeviceCleanupDialogProps) {
  const dialogOpen = isOpen ?? open ?? false;
  const handleConfirmFn = onConfirm ?? onCleanupComplete;
  const handleArchiveFn = onArchive ?? onArchivePreviousUser;
  const displayUser = previousUser ?? (currentUser ? {
    name: `${currentUser.firstName} ${currentUser.lastName}`,
    email: currentUser.email,
  } : undefined);

  const [cleanupChecklist, setCleanupChecklist] = useState({
    archivePreviousUser: false,
    clearPresetMessages: false,
    clearContacts: false,
    resetGarminAccount: false,
    physicalInspection: false,
    factoryReset: false,
  });

  const allChecked = Object.values(cleanupChecklist).every((checked) => checked);

  const handleCheckChange = (key: keyof typeof cleanupChecklist, checked: boolean) => {
    setCleanupChecklist((prev) => ({ ...prev, [key]: checked }));
  };

  const handleConfirm = () => {
    handleConfirmFn?.();
    // Reset checklist
    setCleanupChecklist({
      archivePreviousUser: false,
      clearPresetMessages: false,
      clearContacts: false,
      resetGarminAccount: false,
      physicalInspection: false,
      factoryReset: false,
    });
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Device Cleanup Required
          </DialogTitle>
          <DialogDescription>
            This device was previously assigned. Complete all cleanup steps before reassignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Previous User Info */}
          {displayUser && (
            <Alert variant="destructive">
              <User className="h-4 w-4" />
              <AlertTitle>Previous User Detected</AlertTitle>
              <AlertDescription>
                <div className="mt-2">
                  <p className="font-medium">{displayUser.name}</p>
                  <p className="text-sm">{displayUser.email}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Device Info */}
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">Device</p>
            <p className="font-semibold">{deviceName}</p>
          </div>

          {/* Cleanup Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Pre-Reassignment Checklist</h4>
              <Badge variant={allChecked ? 'default' : 'secondary'}>
                {Object.values(cleanupChecklist).filter(Boolean).length} / 6
              </Badge>
            </div>

            <div className="space-y-3 rounded-lg border p-4">
              {/* Archive Previous User */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="archive"
                  checked={cleanupChecklist.archivePreviousUser}
                  onCheckedChange={(checked) =>
                    handleCheckChange('archivePreviousUser', checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="archive"
                    className="flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Archive className="h-4 w-4 text-muted-foreground" />
                    Archive Previous User Data
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Move user profile and rental history to secure archive
                  </p>
                  {displayUser && !cleanupChecklist.archivePreviousUser && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        handleArchiveFn?.();
                        handleCheckChange('archivePreviousUser', true);
                      }}
                    >
                      <Archive className="mr-2 h-3 w-3" />
                      Archive Now
                    </Button>
                  )}
                </div>
              </div>

              {/* Clear Preset Messages */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="messages"
                  checked={cleanupChecklist.clearPresetMessages}
                  onCheckedChange={(checked) =>
                    handleCheckChange('clearPresetMessages', checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="messages"
                    className="flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Clear Preset Messages
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Remove all custom messages from device
                  </p>
                </div>
              </div>

              {/* Clear Contacts */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="contacts"
                  checked={cleanupChecklist.clearContacts}
                  onCheckedChange={(checked) =>
                    handleCheckChange('clearContacts', checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="contacts"
                    className="flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Clear Contact List
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Remove all emergency contacts from device
                  </p>
                </div>
              </div>

              {/* Reset Garmin Account */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="garmin"
                  checked={cleanupChecklist.resetGarminAccount}
                  onCheckedChange={(checked) =>
                    handleCheckChange('resetGarminAccount', checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="garmin"
                    className="flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Reset Garmin Explore Account
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Unlink from previous user's Garmin account
                  </p>
                </div>
              </div>

              {/* Physical Inspection */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="inspection"
                  checked={cleanupChecklist.physicalInspection}
                  onCheckedChange={(checked) =>
                    handleCheckChange('physicalInspection', checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="inspection"
                    className="flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    Physical Device Inspection
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Verify device condition, battery, and functionality
                  </p>
                </div>
              </div>

              {/* Factory Reset */}
              <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <Checkbox
                  id="factory"
                  checked={cleanupChecklist.factoryReset}
                  onCheckedChange={(checked) =>
                    handleCheckChange('factoryReset', checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="factory"
                    className="flex items-center gap-2 font-medium cursor-pointer text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Factory Reset Device
                  </Label>
                  <p className="text-sm text-destructive/70">
                    Restore device to factory settings (CANNOT BE UNDONE)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Data Privacy & Security</AlertTitle>
            <AlertDescription>
              All cleanup steps must be completed to ensure no previous user data remains on the
              device. This protects customer privacy and maintains data security compliance.
            </AlertDescription>
          </Alert>

          {/* API Communication Warning */}
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Direct Device Communication Required</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                The cleanup process requires <strong>direct API communication</strong> with the Garmin device to:
              </p>
              <ul className="list-disc ml-4 space-y-1 text-sm">
                <li>Clear all preset messages from device memory</li>
                <li>Remove all emergency contacts from device</li>
                <li>Delete location history and waypoints</li>
                <li>Reset device configuration to defaults</li>
              </ul>
              <p className="mt-2 text-sm font-medium">
                ⚠️ This will invoke real Garmin API calls to wipe device data. Ensure all steps are completed before confirming.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!allChecked}>
            {allChecked ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Device Ready for Reassignment
              </>
            ) : (
              `Complete All Steps (${Object.values(cleanupChecklist).filter(Boolean).length}/6)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}