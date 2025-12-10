import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  Zap,
  Upload,
  Download,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  FileText,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
} from 'lucide-react';

interface BulkOperation {
  id: string;
  type: 'activate' | 'deactivate' | 'cleanup' | 'update';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  successCount: number;
  failureCount: number;
  startedAt?: Date;
  completedAt?: Date;
  errors: { imei: string; error: string }[];
}

export default function BulkOperations() {
  const [imeiList, setImeiList] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<'activate' | 'deactivate' | 'cleanup' | 'update'>('activate');
  const [currentOperation, setCurrentOperation] = useState<BulkOperation | null>(null);
  const [operationHistory, setOperationHistory] = useState<BulkOperation[]>([]);

  const parseImeiList = (): string[] => {
    return imeiList
      .split(/[\n,;]/)
      .map(imei => imei.trim())
      .filter(imei => imei.length > 0);
  };

  const handleStartOperation = async () => {
    const imeis = parseImeiList();
    
    if (imeis.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter at least one IMEI number',
        variant: 'destructive',
      });
      return;
    }

    const operation: BulkOperation = {
      id: `bulk-${Date.now()}`,
      type: selectedOperation,
      status: 'processing',
      totalItems: imeis.length,
      processedItems: 0,
      successCount: 0,
      failureCount: 0,
      startedAt: new Date(),
      errors: [],
    };

    setCurrentOperation(operation);

    // Simulate bulk operation
    for (let i = 0; i < imeis.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const success = Math.random() > 0.1; // 90% success rate
      
      setCurrentOperation(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          processedItems: i + 1,
          successCount: prev.successCount + (success ? 1 : 0),
          failureCount: prev.failureCount + (success ? 0 : 1),
          errors: success ? prev.errors : [
            ...prev.errors,
            { imei: imeis[i], error: 'API connection timeout' }
          ],
        };
      });
    }

    setCurrentOperation(prev => {
      if (!prev) return null;
      
      const completedOperation = {
        ...prev,
        status: 'completed' as const,
        completedAt: new Date(),
      };
      
      setOperationHistory(history => [completedOperation, ...history]);
      
      toast({
        title: 'Operation Completed',
        description: `Successfully processed ${prev.successCount} out of ${prev.totalItems} devices`,
      });
      
      return completedOperation;
    });
  };

  const handleCancelOperation = () => {
    if (currentOperation && currentOperation.status === 'processing') {
      setCurrentOperation(prev => {
        if (!prev) return null;
        return { ...prev, status: 'failed' };
      });
      
      toast({
        title: 'Operation Cancelled',
        description: 'Bulk operation has been cancelled',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setCurrentOperation(null);
    setImeiList('');
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'activate':
        return <Power className="h-4 w-4" />;
      case 'deactivate':
        return <PowerOff className="h-4 w-4" />;
      case 'cleanup':
        return <Trash2 className="h-4 w-4" />;
      case 'update':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const exportTemplate = () => {
    const template = `# Bulk Operations Template
# Enter one IMEI per line or separate with commas
# Example:
300434063679420
300434063679421
300434063679422`;
    
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'imei-bulk-template.txt';
    link.click();
  };

  const progress = currentOperation 
    ? (currentOperation.processedItems / currentOperation.totalItems) * 100 
    : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
              <Zap className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl">Bulk Operations</h1>
              <p className="text-sm text-muted-foreground">
                Process multiple devices simultaneously for efficient management
              </p>
            </div>
          </div>
        </div>

        {/* Warning */}
        <Alert className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50">
          <AlertTriangle className="h-5 w-5 text-amber-700" />
          <AlertTitle className="text-amber-900">High-Impact Operations</AlertTitle>
          <AlertDescription className="text-amber-800">
            Bulk operations perform actions on multiple devices simultaneously. These actions communicate directly 
            with Garmin's API and cannot be easily undone. Verify your device list before proceeding.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="operations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
            <TabsTrigger value="operations" className="gap-2">
              <Zap className="h-4 w-4" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <FileText className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Operation Configuration</CardTitle>
                  <CardDescription>Select operation type and enter device IMEIs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="operation-type">Operation Type</Label>
                    <Select
                      value={selectedOperation}
                      onValueChange={(value) => setSelectedOperation(value as any)}
                      disabled={currentOperation?.status === 'processing'}
                    >
                      <SelectTrigger id="operation-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activate">
                          <div className="flex items-center gap-2">
                            <Power className="h-4 w-4" />
                            Activate Devices
                          </div>
                        </SelectItem>
                        <SelectItem value="deactivate">
                          <div className="flex items-center gap-2">
                            <PowerOff className="h-4 w-4" />
                            Deactivate Devices
                          </div>
                        </SelectItem>
                        <SelectItem value="cleanup">
                          <div className="flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Cleanup & Reset
                          </div>
                        </SelectItem>
                        <SelectItem value="update">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Update Settings
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="imei-list">Device IMEIs</Label>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={exportTemplate}
                        className="h-auto p-0"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Template
                      </Button>
                    </div>
                    <Textarea
                      id="imei-list"
                      placeholder="Enter IMEIs (one per line or comma-separated)&#10;300434063679420&#10;300434063679421&#10;300434063679422"
                      value={imeiList}
                      onChange={(e) => setImeiList(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                      disabled={currentOperation?.status === 'processing'}
                    />
                    <p className="text-xs text-muted-foreground">
                      {parseImeiList().length} device{parseImeiList().length !== 1 ? 's' : ''} detected
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {!currentOperation || currentOperation.status === 'completed' || currentOperation.status === 'failed' ? (
                      <>
                        <Button
                          onClick={handleStartOperation}
                          className="flex-1 gap-2"
                          disabled={parseImeiList().length === 0}
                        >
                          <Play className="h-4 w-4" />
                          Start Operation
                        </Button>
                        {currentOperation && (
                          <Button variant="outline" onClick={handleReset}>
                            Reset
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        onClick={handleCancelOperation}
                        variant="destructive"
                        className="flex-1 gap-2"
                        disabled={currentOperation.status !== 'processing'}
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Operation
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Operation Progress</CardTitle>
                  <CardDescription>Real-time processing status</CardDescription>
                </CardHeader>
                <CardContent>
                  {currentOperation ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getOperationIcon(currentOperation.type)}
                          <span className="font-medium capitalize">{currentOperation.type} Operation</span>
                        </div>
                        <Badge
                          variant={currentOperation.status === 'completed' ? 'default' : 'secondary'}
                          className="gap-1"
                        >
                          {getStatusIcon(currentOperation.status)}
                          <span className="capitalize">{currentOperation.status}</span>
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {currentOperation.processedItems} / {currentOperation.totalItems}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg bg-muted text-center">
                          <p className="text-2xl font-semibold">{currentOperation.totalItems}</p>
                          <p className="text-xs text-muted-foreground mt-1">Total</p>
                        </div>
                        <div className="p-4 rounded-lg bg-success/10 text-center">
                          <p className="text-2xl font-semibold text-success">{currentOperation.successCount}</p>
                          <p className="text-xs text-muted-foreground mt-1">Success</p>
                        </div>
                        <div className="p-4 rounded-lg bg-destructive/10 text-center">
                          <p className="text-2xl font-semibold text-destructive">{currentOperation.failureCount}</p>
                          <p className="text-xs text-muted-foreground mt-1">Failed</p>
                        </div>
                      </div>

                      {currentOperation.errors.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-destructive">Errors ({currentOperation.errors.length})</Label>
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {currentOperation.errors.map((error, index) => (
                              <div key={index} className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                                <p className="text-sm font-medium font-mono">{error.imei}</p>
                                <p className="text-xs text-destructive/80 mt-1">{error.error}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentOperation.startedAt && (
                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                          <span>Started: {currentOperation.startedAt.toLocaleTimeString()}</span>
                          {currentOperation.completedAt && (
                            <span>Completed: {currentOperation.completedAt.toLocaleTimeString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Zap className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No operation in progress</p>
                      <p className="text-sm mt-1">Configure and start an operation to see progress</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Operation History</CardTitle>
                <CardDescription>Previous bulk operations and their results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {operationHistory.map((operation) => (
                    <div
                      key={operation.id}
                      className="p-4 rounded-lg border-2 border-border hover:bg-accent/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getOperationIcon(operation.type)}
                          <span className="font-medium capitalize">{operation.type} Operation</span>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          {getStatusIcon(operation.status)}
                          <span className="capitalize">{operation.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-lg font-semibold">{operation.totalItems}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Success</p>
                          <p className="text-lg font-semibold text-success">{operation.successCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Failed</p>
                          <p className="text-lg font-semibold text-destructive">{operation.failureCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Success Rate</p>
                          <p className="text-lg font-semibold">
                            {Math.round((operation.successCount / operation.totalItems) * 100)}%
                          </p>
                        </div>
                      </div>

                      {operation.startedAt && operation.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          {operation.startedAt.toLocaleDateString()} at {operation.startedAt.toLocaleTimeString()} - 
                          Duration: {Math.round((operation.completedAt.getTime() - operation.startedAt.getTime()) / 1000)}s
                        </p>
                      )}
                    </div>
                  ))}
                  {operationHistory.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No operation history</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
