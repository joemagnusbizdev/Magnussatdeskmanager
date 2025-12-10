/**
 * Workflow Status Tracker
 * Real-time status display for rentals going through activation workflow
 * Shows CS reps exactly where each rental is in the process
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  User,
  Smartphone,
  Send,
  Building2,
} from 'lucide-react';

export type WorkflowStatus = 
  | 'pending'           // Order received, not started
  | 'collecting-info'   // Gathering customer data
  | 'assigning-device'  // Selecting device
  | 'processing-payment'// Payment processing
  | 'activating'        // Activating in Garmin
  | 'syncing-cc'        // Syncing to Command Center
  | 'completed'         // Ready for customer
  | 'failed';           // Error occurred

export interface WorkflowItem {
  id: string;
  orderId?: string;
  customerName?: string;
  source: 'website' | 'phone-individual' | 'phone-b2b' | 'b2b-bulk';
  status: WorkflowStatus;
  deviceCount?: number;
  currentStep?: string;
  progress: number; // 0-100
  startedAt: string;
  estimatedCompletion?: string;
  error?: string;
}

interface WorkflowStatusTrackerProps {
  items: WorkflowItem[];
  onRetry?: (itemId: string) => void;
  compact?: boolean;
}

export function WorkflowStatusTracker({ 
  items, 
  onRetry,
  compact = false 
}: WorkflowStatusTrackerProps) {
  const getStatusConfig = (status: WorkflowStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300'
        };
      case 'collecting-info':
        return {
          icon: User,
          label: 'Collecting Info',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300'
        };
      case 'assigning-device':
        return {
          icon: Smartphone,
          label: 'Assigning Device',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          borderColor: 'border-purple-300'
        };
      case 'processing-payment':
        return {
          icon: Building2,
          label: 'Processing Payment',
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100',
          borderColor: 'border-indigo-300'
        };
      case 'activating':
        return {
          icon: Loader2,
          label: 'Activating',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          borderColor: 'border-orange-300',
          animate: true
        };
      case 'syncing-cc':
        return {
          icon: Send,
          label: 'Syncing to Command Center',
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-100',
          borderColor: 'border-cyan-300',
          animate: true
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          label: 'Completed',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          label: 'Failed',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300'
        };
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'website':
        return <Badge className="bg-blue-600">Website</Badge>;
      case 'phone-individual':
        return <Badge className="bg-green-600">Phone</Badge>;
      case 'phone-b2b':
        return <Badge className="bg-purple-600">B2B Phone</Badge>;
      case 'b2b-bulk':
        return <Badge className="bg-orange-600">B2B Bulk</Badge>;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No active workflows
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    // Compact view - just counts and progress bars
    return (
      <div className="space-y-2">
        {items.map(item => {
          const config = getStatusConfig(item.status);
          const Icon = config.icon;
          
          return (
            <div key={item.id} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor}`}>
                <Icon className={`h-4 w-4 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {item.customerName || item.orderId || `Rental ${item.id}`}
                  </span>
                  <span className={`text-xs ${config.color}`}>{config.label}</span>
                </div>
                <Progress value={item.progress} className="h-1 mt-1" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Full view - detailed cards
  return (
    <div className="space-y-3">
      {items.map(item => {
        const config = getStatusConfig(item.status);
        const Icon = config.icon;
        
        return (
          <Card 
            key={item.id} 
            className={`border-2 ${config.borderColor} transition-all hover:shadow-md`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-5 w-5 ${config.color} ${config.animate ? 'animate-spin' : ''}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {item.customerName || 'New Rental'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {getSourceBadge(item.source)}
                      {item.orderId && (
                        <span className="text-xs text-muted-foreground">
                          Order #{item.orderId}
                        </span>
                      )}
                      {item.deviceCount && item.deviceCount > 1 && (
                        <Badge variant="outline">
                          {item.deviceCount} devices
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge className={`${config.bgColor} ${config.color} border ${config.borderColor}`}>
                    {config.label}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    Started {formatTime(item.startedAt)}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">
                    {item.currentStep || 'Processing...'}
                  </span>
                  <span className="font-semibold">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>

              {/* Estimated Completion */}
              {item.estimatedCompletion && item.status !== 'completed' && item.status !== 'failed' && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Est. completion: {formatTime(item.estimatedCompletion)}</span>
                </div>
              )}

              {/* Error Message */}
              {item.status === 'failed' && item.error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">Error</div>
                      <div className="mt-1">{item.error}</div>
                      {onRetry && (
                        <button
                          onClick={() => onRetry(item.id)}
                          className="mt-2 text-xs font-semibold underline hover:no-underline"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {item.status === 'completed' && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">
                      Rental activated and synced to Command Center
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Hook for managing workflow status
export function useWorkflowStatus() {
  // This would connect to your real-time status updates
  // For now, it's a placeholder
  
  const addWorkflow = (workflow: Omit<WorkflowItem, 'id' | 'progress' | 'startedAt'>) => {
    // TODO: Implement workflow creation
    console.log('Adding workflow:', workflow);
  };

  const updateWorkflowStatus = (id: string, updates: Partial<WorkflowItem>) => {
    // TODO: Implement workflow update
    console.log('Updating workflow:', id, updates);
  };

  const retryWorkflow = (id: string) => {
    // TODO: Implement workflow retry
    console.log('Retrying workflow:', id);
  };

  return {
    addWorkflow,
    updateWorkflowStatus,
    retryWorkflow
  };
}
