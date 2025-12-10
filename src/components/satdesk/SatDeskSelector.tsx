import { useSatDeskStore } from '@/stores/satDeskStore';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Radio } from 'lucide-react';

export function SatDeskSelector() {
  const { satDesks, selectedSatDeskId, setSelectedSatDesk } = useSatDeskStore();
  const activeSatDesks = satDesks.filter((sd) => sd.isActive);

  const selectedDesk = satDesks.find((sd) => sd.id === selectedSatDeskId);

  return (
    <div className="w-full">
      <Select
        value={selectedSatDeskId || 'all'}
        onValueChange={(value) => setSelectedSatDesk(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-full bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-sidebar-primary" />
            <SelectValue placeholder="All SatDesks" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <span className="font-medium">All SatDesks</span>
              <span className="text-xs text-muted-foreground">
                ({activeSatDesks.length} active)
              </span>
            </div>
          </SelectItem>
          {activeSatDesks.map((satDesk) => (
            <SelectItem key={satDesk.id} value={satDesk.id}>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded text-xs font-bold',
                    'bg-accent text-accent-foreground'
                  )}
                >
                  {satDesk.number}
                </span>
                <span className="font-medium">{satDesk.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({satDesk.deviceCount} devices)
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedDesk && (
        <p className="mt-2 text-xs text-sidebar-foreground/60 px-1">
          {selectedDesk.description}
        </p>
      )}
    </div>
  );
}
