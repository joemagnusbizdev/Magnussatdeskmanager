import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuditLogStore } from '@/stores/auditLogStore';
import {
  ScrollText,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLog() {
  const { logs, getLogs } = useAuditLogStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedLogData = selectedLog ? logs.find(l => l.id === selectedLog) : null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      device: 'bg-blue-100 text-blue-700 border-blue-300',
      rental: 'bg-purple-100 text-purple-700 border-purple-300',
      satdesk: 'bg-green-100 text-green-700 border-green-300',
      order: 'bg-orange-100 text-orange-700 border-orange-300',
      settings: 'bg-slate-100 text-slate-700 border-slate-300',
      api: 'bg-cyan-100 text-cyan-700 border-cyan-300',
      system: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `audit-log-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
              <ScrollText className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl">Audit Log</h1>
              <p className="text-sm text-muted-foreground">
                Complete activity tracking and compliance monitoring
              </p>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions, users, entities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="device">Device</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                  <SelectItem value="satdesk">SatDesk</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-semibold">{filteredLogs.length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <p className="text-2xl font-semibold text-success">
                    {filteredLogs.filter(l => l.status === 'success').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-semibold text-destructive">
                    {filteredLogs.filter(l => l.status === 'failed').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                  <p className="text-2xl font-semibold text-warning">
                    {filteredLogs.filter(l => l.status === 'warning').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Log Entries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Log List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Recent system activities and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLog === log.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-border hover:border-purple-300 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(log.status)}
                          <p className="font-medium truncate">{log.action}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{log.userName}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(log.timestamp, 'MMM dd, HH:mm:ss')}</span>
                          </div>
                        </div>
                        {log.entityName && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {log.entityType}: {log.entityName}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={getCategoryColor(log.category)}>
                        {log.category}
                      </Badge>
                    </div>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No audit logs found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Log Details */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Detailed information about the selected event</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedLogData ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    {getStatusIcon(selectedLogData.status)}
                    <div className="flex-1">
                      <p className="font-medium">{selectedLogData.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedLogData.timestamp, 'MMMM dd, yyyy • HH:mm:ss')}
                      </p>
                    </div>
                    <Badge variant="outline" className={getCategoryColor(selectedLogData.category)}>
                      {selectedLogData.category}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">User</p>
                      <p className="text-sm text-muted-foreground">{selectedLogData.userName}</p>
                      <p className="text-xs text-muted-foreground">ID: {selectedLogData.userId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Entity</p>
                      <p className="text-sm text-muted-foreground">{selectedLogData.entityType}</p>
                      {selectedLogData.entityName && (
                        <p className="text-xs text-muted-foreground">{selectedLogData.entityName}</p>
                      )}
                    </div>
                  </div>

                  {selectedLogData.changes && selectedLogData.changes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Changes Made</p>
                      <div className="space-y-2">
                        {selectedLogData.changes.map((change, index) => (
                          <div key={index} className="p-3 rounded-lg bg-muted">
                            <p className="text-sm font-medium mb-1">{change.field}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-destructive line-through">
                                {JSON.stringify(change.oldValue)}
                              </span>
                              <span>→</span>
                              <span className="text-success">
                                {JSON.stringify(change.newValue)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLogData.metadata && Object.keys(selectedLogData.metadata).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Metadata</p>
                      <div className="p-3 rounded-lg bg-muted">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(selectedLogData.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedLogData.errorMessage && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm font-medium text-destructive mb-1">Error Message</p>
                      <p className="text-sm text-destructive/80">{selectedLogData.errorMessage}</p>
                    </div>
                  )}

                  {selectedLogData.ipAddress && (
                    <div>
                      <p className="text-sm font-medium mb-1">IP Address</p>
                      <p className="text-sm text-muted-foreground font-mono">{selectedLogData.ipAddress}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Select an event to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
