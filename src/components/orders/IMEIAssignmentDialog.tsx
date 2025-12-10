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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Device } from '@/types/device';
import { RentalOrder } from '@/stores/orderStore';
import { InventoryView } from './InventoryView';
import {
  CheckCircle2,
  Package,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Smartphone,
  ArrowRight,
} from 'lucide-react';

interface IMEIAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: RentalOrder;
  availableDevices: Device[];
  onAssign: (orderId: string, deviceId: string, imei: string) => void;
}

export function IMEIAssignmentDialog({
  isOpen,
  onOpenChange,
  order,
  availableDevices,
  onAssign,
}: IMEIAssignmentDialogProps) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const handleAssign = () => {
    if (selectedDevice) {
      onAssign(order.id, selectedDevice.id, selectedDevice.imei);
      setSelectedDevice(null);
      onOpenChange(false);
    }
  };

  const needsCleanup = selectedDevice && (selectedDevice.status === 'archived' || selectedDevice.user);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-accent" />
            Assign Device to Order
          </DialogTitle>
          <DialogDescription>
            Select an available device from inventory to fulfill this order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Order Details</h3>
              <Badge variant="outline">{order.orderNumber}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Customer</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customerInfo.firstName} {order.customerInfo.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Rental Period</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.rentalDetails.startDate).toLocaleDateString()} -{' '}
                    {new Date(order.rentalDetails.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {order.preferences.presetMessages && order.preferences.presetMessages.length > 0 && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Preset Messages ({order.preferences.presetMessages.length})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.preferences.presetMessages[0].message}
                      {order.preferences.presetMessages.length > 1 && '...'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Data Completeness Status */}
            {order.dataComplete ? (
              <Alert className="mt-3 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">All Data Complete</AlertTitle>
                <AlertDescription className="text-green-700">
                  Customer info, emergency contacts, and preset messages are ready
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive" className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Missing Information</AlertTitle>
                <AlertDescription>
                  This order requires additional data before it can be fully processed
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Selected Device Preview */}
          {selectedDevice && (
            <div className="rounded-lg border-2 border-accent bg-accent/5 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{selectedDevice.deviceName}</p>
                  <p className="font-mono text-sm text-muted-foreground">
                    IMEI: {selectedDevice.imei}
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-primary to-accent">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Selected
                </Badge>
              </div>

              {needsCleanup && (
                <Alert variant="default" className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-900">Cleanup Required</AlertTitle>
                  <AlertDescription className="text-orange-700">
                    This device will need to be cleaned before assignment. You'll be prompted to
                    complete the cleanup checklist after assigning.
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
                <span>
                  Will be assigned to {order.customerInfo.firstName} {order.customerInfo.lastName}
                </span>
              </div>
            </div>
          )}

          {/* Inventory */}
          <InventoryView
            devices={availableDevices}
            onSelectDevice={setSelectedDevice}
            selectedDeviceId={selectedDevice?.id}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedDevice}>
            {selectedDevice ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Assign {selectedDevice.imei} to Order
              </>
            ) : (
              'Select a Device'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
