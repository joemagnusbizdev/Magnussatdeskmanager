import { useNavigate } from 'react-router-dom';
import { Device } from '@/types/device';
import { StatusBadge } from './StatusBadge';
import { useSatDeskStore } from '@/stores/satDeskStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, MoreHorizontal, Edit, Trash2, PackageCheck, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DeviceTableProps {
  devices: Device[];
  showAll?: boolean;
  selectedDevices?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
}

export function DeviceTable({ 
  devices, 
  showAll = false,
  selectedDevices,
  onSelectionChange,
}: DeviceTableProps) {
  const navigate = useNavigate();
  const displayDevices = showAll ? devices : devices.slice(0, 5);
  const { satDesks } = useSatDeskStore();

  const getSatDeskName = (satDeskId: string) => {
    const satDesk = satDesks.find((sd) => sd.id === satDeskId);
    return satDesk ? satDesk.name : 'Unknown';
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(new Set(displayDevices.map(d => d.id)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectDevice = (deviceId: string, checked: boolean) => {
    if (!onSelectionChange || !selectedDevices) return;
    const newSelection = new Set(selectedDevices);
    if (checked) {
      newSelection.add(deviceId);
    } else {
      newSelection.delete(deviceId);
    }
    onSelectionChange(newSelection);
  };

  const isAllSelected = selectedDevices && displayDevices.length > 0 && 
    displayDevices.every(d => selectedDevices.has(d.id));

  return (
    <div className="overflow-hidden rounded-xl border-2 border-border/50 bg-white/70 shadow-lg backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-border/50 bg-gradient-to-r from-purple-50/50 to-background hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-background">
            {onSelectionChange && (
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            <TableHead className="font-bold text-foreground">IMEI</TableHead>
            <TableHead className="font-bold text-foreground">Device #</TableHead>
            <TableHead className="font-bold text-foreground">SatDesk</TableHead>
            <TableHead className="font-bold text-foreground">User</TableHead>
            <TableHead className="font-bold text-foreground">Status / Location</TableHead>
            <TableHead className="font-bold text-foreground">Rental Period</TableHead>
            <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayDevices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={onSelectionChange ? 8 : 7} className="h-24 text-center">
                No devices found.
              </TableCell>
            </TableRow>
          ) : (
            displayDevices.map((device, index) => (
              <TableRow
                key={device.id}
                className="cursor-pointer transition-all hover:bg-purple-50/30"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={(e) => {
                  // Don't navigate if clicking on checkbox or actions
                  const target = e.target as HTMLElement;
                  if (!target.closest('button') && !target.closest('[role="checkbox"]')) {
                    navigate(`/device/${device.id}`);
                  }
                }}
              >
                {onSelectionChange && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedDevices?.has(device.id) || false}
                      onCheckedChange={(checked) => handleSelectDevice(device.id, checked as boolean)}
                      aria-label={`Select device ${device.deviceNumber}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {device.imei}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-purple-900">Device #{device.deviceNumber}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-sm font-medium text-purple-900">
                      {getSatDeskName(device.satDeskId)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {device.user ? (
                    <div>
                      <p className="font-semibold">
                        {device.user.firstName} {device.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{device.user.email}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={device.status} />
                    {device.location === 'out' ? (
                      <Badge 
                        variant="secondary" 
                        className="gap-1 border-2 border-blue-300 bg-blue-50 text-blue-700"
                      >
                        <MapPin className="h-3 w-3" />
                        Field
                      </Badge>
                    ) : (
                      <Badge 
                        variant="secondary" 
                        className="gap-1 border-2 border-gray-300 bg-gray-50 text-gray-700"
                      >
                        <PackageCheck className="h-3 w-3" />
                        Inventory
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(device.rentalStart).toLocaleDateString()} –{' '}
                  {new Date(device.rentalEnd).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-purple-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/device/${device.id}`);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement edit functionality
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Device
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement archive functionality
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Archive Device
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}