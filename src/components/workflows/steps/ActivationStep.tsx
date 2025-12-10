import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Smartphone,
  Send,
  Database,
  Mail,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivationTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  icon: any;
  error?: string;
}

interface ActivationStepProps {
  devices: Array<{
    deviceId: string;
    deviceName: string;
    imei: string;
  }>;
  customerEmail: string;
  onActivationComplete: (success: boolean) => void;
}

export function ActivationStep({ 
  devices, 
  customerEmail,
  onActivationComplete 
}: ActivationStepProps) {
  const [tasks, setTasks] = useState<ActivationTask[]>([
    {
      id: 'garmin',
      title: 'Activate in Garmin System',
      description: `Activating ${devices.length} device${devices.length > 1 ? 's' : ''} in Garmin inReach Manager`,
      status: 'pending',
      icon: Smartphone,
    },
    {
      id: 'command-center',
      title: 'Sync to Command Center',
      description: 'Sending customer and device data to Command Center',
      status: 'pending',
      icon: Send,
    },
    {
      id: 'database',
      title: 'Update Database',
      description: 'Creating rental record and updating inventory',
      status: 'pending',
      icon: Database,
    },
    {
      id: 'email',
      title: 'Send Confirmation Email',
      description: `Sending rental details to ${customerEmail}`,
      status: 'pending',
      icon: Mail,
    },
  ]);

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Start activation process
    processNextTask(0);
  }, []);

  const processNextTask = async (taskIndex: number) => {
    if (taskIndex >= tasks.length) {
      // All tasks complete
      setIsComplete(true);
      setOverallProgress(100);
      onActivationComplete(true);
      return;
    }

    // Update current task to processing
    setCurrentTaskIndex(taskIndex);
    updateTaskStatus(taskIndex, 'processing');

    // Simulate API call - Replace with real API calls
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate random failure (10% chance) - Remove in production
    const shouldFail = Math.random() < 0.1;

    if (shouldFail && taskIndex === 0) {
      // Simulate failure on first task
      updateTaskStatus(taskIndex, 'failed', 'Failed to connect to Garmin API');
      setHasError(true);
      onActivationComplete(false);
      return;
    }

    // Mark task as completed
    updateTaskStatus(taskIndex, 'completed');
    
    // Update progress
    const progress = ((taskIndex + 1) / tasks.length) * 100;
    setOverallProgress(progress);

    // Process next task
    processNextTask(taskIndex + 1);
  };

  const updateTaskStatus = (
    taskIndex: number, 
    status: ActivationTask['status'],
    error?: string
  ) => {
    setTasks(prev => prev.map((task, index) => 
      index === taskIndex 
        ? { ...task, status, error }
        : task
    ));
  };

  const handleRetry = () => {
    // Reset failed tasks
    const failedTaskIndex = tasks.findIndex(t => t.status === 'failed');
    if (failedTaskIndex !== -1) {
      setTasks(prev => prev.map(task => ({
        ...task,
        status: task.status === 'failed' ? 'pending' : task.status
      })));
      setHasError(false);
      processNextTask(failedTaskIndex);
    }
  };

  const getStatusIcon = (status: ActivationTask['status']) => {
    switch (status) {
      case 'pending':
        return null;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: ActivationTask['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Waiting</Badge>;
      case 'processing':
        return <Badge className="bg-blue-600">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">
          {isComplete ? 'Activation Complete!' : 'Activating Rental...'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isComplete 
            ? 'All systems updated successfully' 
            : 'Please wait while we process your rental'}
        </p>
      </div>

      {/* Overall Progress */}
      <Card className={isComplete ? 'border-2 border-green-500' : ''}>
        <CardHeader>
          <CardTitle className="text-base">Overall Progress</CardTitle>
          <CardDescription>
            {isComplete ? 'All tasks completed' : `Processing task ${currentTaskIndex + 1} of ${tasks.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={overallProgress} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {Math.round(overallProgress)}% Complete
            </span>
            {isComplete && (
              <span className="flex items-center gap-1 text-green-600 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Success
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task, index) => {
          const Icon = task.icon;
          const isActive = index === currentTaskIndex;
          
          return (
            <Card 
              key={task.id}
              className={`transition-all ${
                isActive ? 'border-2 border-blue-500 shadow-md' : ''
              } ${task.status === 'failed' ? 'border-2 border-red-500' : ''}`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`rounded-lg p-2 ${
                    task.status === 'completed' ? 'bg-green-100' :
                    task.status === 'processing' ? 'bg-blue-100' :
                    task.status === 'failed' ? 'bg-red-100' :
                    'bg-muted'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      task.status === 'completed' ? 'text-green-600' :
                      task.status === 'processing' ? 'text-blue-600' :
                      task.status === 'failed' ? 'text-red-600' :
                      'text-muted-foreground'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold">{task.title}</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>

                    {/* Error Message */}
                    {task.status === 'failed' && task.error && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{task.error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Processing Indicator */}
                    {task.status === 'processing' && (
                      <div className="mt-2">
                        <Progress value={undefined} className="h-1" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Error Alert with Retry */}
      {hasError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Activation Failed</AlertTitle>
          <AlertDescription>
            <p className="mb-3">
              An error occurred during activation. This could be due to:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Network connectivity issues</li>
              <li>Garmin API temporarily unavailable</li>
              <li>Device already activated in another account</li>
            </ul>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={handleRetry}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Activation
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {isComplete && (
        <Alert className="border-2 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Rental Activated Successfully!</AlertTitle>
          <AlertDescription className="text-green-700">
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Devices activated in Garmin system</li>
              <li>Customer data synced to Command Center</li>
              <li>Rental record created in database</li>
              <li>Confirmation email sent to customer</li>
            </ul>
            <p className="mt-3 font-semibold">
              You can now hand the devices to the customer.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Info Alert */}
      {!isComplete && !hasError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Please don't close this window.</strong> The activation process typically takes 30-60 seconds.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
