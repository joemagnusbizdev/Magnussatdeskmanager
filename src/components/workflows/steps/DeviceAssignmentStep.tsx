import { useState } from 'react';
import { InventoryManager } from '@/components/workflows/InventoryManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Smartphone, AlertCircle } from 'lucide-react';

interface DeviceAssignmentStepProps {
  rentalType: 'individual' | 'b2b' | 'bulk';
  deviceCount?: number; // For B2B/bulk
  startDate: string;
  endDate: string;
  onDevicesAssigned: (deviceIds: string[]) => void;
}

export function DeviceAssignmentStep({
  rentalType,
  deviceCount = 1,
  startDate,
  endDate,
  onDevicesAssigned
}: DeviceAssignmentStepProps) {
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  // Mock device data - TODO: Replace with real API call
  const mockDevices = [
    {
      deviceId: 'dev-1',
      imei: '300434063472450',
      deviceNumber: 1,
      deviceName: 'inReach Mini 2 - Alpha',
      satDeskId: 'sd-1',
      status: 'available' as const,
      condition: 'excellent' as const,
      batteryHealth: 95,
    },
    {
      deviceId: 'dev-2',
      imei: '300434063472451',
      deviceNumber: 2,
      deviceName: 'inReach Mini 2 - Beta',
      satDeskId: 'sd-1',
      status: 'available' as const,
      condition: 'excellent' as const,
      batteryHealth: 92,
    },
    {
      deviceId: 'dev-3',
      imei: '300434063472452',
      deviceNumber: 3,
      deviceName: 'inReach Explorer+ - Gamma',
      satDeskId: 'sd-2',
      status: 'available' as const,
      condition: 'good' as const,
      batteryHealth: 88,
    },
    {
      deviceId: 'dev-4',
      imei: '300434063472453',
      deviceNumber: 4,
      deviceName: 'inReach Mini 2 - Delta',
      satDeskId: 'sd-2',
      status: 'available' as const,
      condition: 'excellent' as const,
      batteryHealth: 97,
    },
    {
      deviceId: 'dev-5',
      imei: '300434063472454',
      deviceNumber: 5,
      deviceName: 'inReach Messenger - Echo',
      satDeskId: 'sd-1',
      status: 'rented' as const,
      condition: 'good' as const,
      batteryHealth: 85,
    },
  ];

  const handleDeviceAssign = (deviceId: string) => {
    if (rentalType === 'individual') {
      // Single device - just select it
      setSelectedDevices([deviceId]);
      onDevicesAssigned([deviceId]);
    } else {
      // Multiple devices - add to selection
      const newSelection = [...selectedDevices, deviceId];
      setSelectedDevices(newSelection);
      
      // Auto-trigger if we have enough devices
      if (newSelection.length >= deviceCount) {
        onDevicesAssigned(newSelection);
      }
    }
  };

  const handleRemoveDevice = (deviceId: string) => {
    setSelectedDevices(prev => prev.filter(id => id !== deviceId));
  };

  const isComplete = selectedDevices.length >= deviceCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">
          {rentalType === 'individual' 
            ? 'Select Device' 
            : `Select ${deviceCount} Devices`}
        </h3>
        <p className="text-sm text-muted-foreground">
          Rental period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
        </p>
      </div>

      {/* Selection Progress */}
      {rentalType !== 'individual' && (
        <Alert className={isComplete ? 'border-green-500 bg-green-50' : ''}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>
              {selectedDevices.length} of {deviceCount} devices selected
            </strong>
            {isComplete && ' - Ready to proceed!'}
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Devices Summary */}
      {selectedDevices.length > 0 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Selected Devices ({selectedDevices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedDevices.map(deviceId => {
                const device = mockDevices.find(d => d.deviceId === deviceId);
                if (!device) return null;
                
                return (
                  <div 
                    key={deviceId}
                    className="flex items-center justify-between rounded-lg border bg-green-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-semibold text-sm">{device.deviceName}</div>
                        <div className="text-xs text-muted-foreground">
                          IMEI: {device.imei} • #{device.deviceNumber}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">Selected</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDevice(deviceId)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Manager */}
      <InventoryManager
        devices={mockDevices}
        onAssignDevice={handleDeviceAssign}
        showSuggestions={selectedDevices.length === 0}
      />

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {rentalType === 'individual' 
            ? 'Click "Assign" on any available device to select it.'
            : `Select ${deviceCount} devices by clicking "Assign" on each one. The best devices are suggested at the top.`}
        </AlertDescription>
      </Alert>
    </div>
  );
}
