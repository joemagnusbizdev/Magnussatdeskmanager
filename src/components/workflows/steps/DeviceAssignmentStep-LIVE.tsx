/**
 * UPDATED: DeviceAssignmentStep with Real Device API
 * Replace: src/components/workflows/steps/DeviceAssignmentStep.tsx
 */

import { useState, useEffect } from 'react';
import { InventoryManager } from '@/components/workflows/InventoryManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Smartphone, AlertCircle, Loader2 } from 'lucide-react';

// Import real API service
import { getAvailableDevices, Device } from '@/services/api/devices';

interface DeviceAssignmentStepProps {
  rentalType: 'individual' | 'b2b' | 'bulk';
  deviceCount?: number;
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
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load devices from API
  useEffect(() => {
    const loadDevices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('🔄 Loading available devices...');
        
        const availableDevices = await getAvailableDevices();
        
        console.log(`✅ Loaded ${availableDevices.length} device(s)`);
        setDevices(availableDevices);
        
      } catch (err) {
        console.error('❌ Error loading devices:', err);
        setError('Failed to load devices. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDevices();
  }, [startDate, endDate]);

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

  // Loading state
  if (isLoading) {
    return (
      <Alert className="border-blue-500 bg-blue-50">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Loading available devices...
        </AlertDescription>
      </Alert>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Error:</strong> {error}
        </AlertDescription>
      </Alert>
    );
  }

  // No devices available
  if (devices.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>No devices available</strong> for the selected rental period.
          <br />
          <span className="text-sm">Period: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
        </AlertDescription>
      </Alert>
    );
  }

  // Transform Device to format expected by InventoryManager
  const inventoryDevices = devices.map((device) => ({
    deviceId: device.id,
    imei: device.imei,
    deviceNumber: device.imei.slice(-4), // Last 4 digits for display
    deviceName: device.device_name,
    satDeskId: device.sat_desk_name,
    status: device.status as 'available' | 'rented' | 'maintenance',
    condition: device.condition as 'excellent' | 'good' | 'fair' | 'poor',
    batteryHealth: device.battery_health,
  }));

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
        <p className="text-sm text-green-600 font-medium mt-1">
          ✅ {devices.length} device(s) available
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
                const device = devices.find(d => d.id === deviceId);
                if (!device) return null;
                
                return (
                  <div 
                    key={deviceId}
                    className="flex items-center justify-between rounded-lg border bg-green-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-semibold text-sm">{device.device_name}</div>
                        <div className="text-xs text-muted-foreground">
                          IMEI: {device.imei} • {device.sat_desk_name}
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
        devices={inventoryDevices}
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
