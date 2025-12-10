/**
 * API Mode Indicator
 * Shows current API mode (mock vs real) in the UI
 */

import { useAppConfigStore } from '@/stores/appConfigStore';
import { Badge } from '@/components/ui/badge';
import { Database, Server, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ApiModeIndicator() {
  const { useMockData, apiConnected } = useAppConfigStore();
  const navigate = useNavigate();

  if (!useMockData && apiConnected) {
    // Real API mode - don't show indicator
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-accent"
            onClick={() => navigate('/settings')}
          >
            {useMockData ? (
              <>
                <Database className="h-3 w-3 mr-1" />
                Mock Mode
              </>
            ) : (
              <>
                <Server className="h-3 w-3 mr-1 text-amber-500" />
                Disconnected
              </>
            )}
            <Settings className="h-3 w-3 ml-1 opacity-50" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {useMockData ? (
              <>
                <p className="font-semibold">Mock Data Mode</p>
                <p className="text-xs text-muted-foreground">
                  Using sample data. Changes won't be saved.
                </p>
                <p className="text-xs text-purple-600">
                  Click to configure backend connection
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-amber-600">Backend Disconnected</p>
                <p className="text-xs text-muted-foreground">
                  Unable to reach backend API
                </p>
                <p className="text-xs text-purple-600">
                  Click to check connection settings
                </p>
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
