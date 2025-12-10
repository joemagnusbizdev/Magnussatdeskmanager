import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSalesStore } from '@/stores/salesStore';
import { useSatDeskStore } from '@/stores/satDeskStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BulkUserAssignment } from '@/components/sales/BulkUserAssignment';
import { toast } from 'sonner@2.0.3';
import {
  ShoppingBag,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Smartphone,
  Building2,
  Users,
  Trash2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import type { DeviceSale } from '@/stores/salesStore';

export default function Sales() {
  const navigate = useNavigate();
  const { sales, deleteSale, updateSale } = useSalesStore();
  const { satDesks } = useSatDeskStore();
  const [selectedSale, setSelectedSale] = useState<DeviceSale | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBulkAssignmentOpen, setIsBulkAssignmentOpen] = useState(false);

  const pendingSales = sales.filter((s) => s.status === 'pending');
  const activatedSales = sales.filter((s) => s.status === 'activated');
  const completedSales = sales.filter((s) => s.status === 'completed');
  
  const totalRevenue = sales
    .filter((s) => s.totalAmount)
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const totalDevicesSold = sales.reduce((sum, s) => sum + s.devices.length, 0);

  const handleViewDetails = (sale: DeviceSale) => {
    setSelectedSale(sale);
    setIsDetailOpen(true);
  };

  const handleDeleteSale = (saleId: string) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      deleteSale(saleId);
      toast.success('Sale deleted successfully');
      setIsDetailOpen(false);
    }
  };

  const handleActivateSale = (saleId: string) => {
    updateSale(saleId, {
      status: 'activated',
      activationDate: new Date().toISOString().split('T')[0],
    });
    toast.success('Sale activated successfully');
  };

  const handleCompleteSale = (saleId: string) => {
    updateSale(saleId, { status: 'completed' });
    toast.success('Sale marked as completed');
  };

  const getStatusBadge = (status: DeviceSale['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      activated: { variant: 'default' as const, icon: CheckCircle2, color: 'text-blue-600' },
      completed: { variant: 'outline' as const, icon: CheckCircle2, color: 'text-green-600' },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentBadge = (paymentStatus: DeviceSale['paymentStatus']) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      partial: { variant: 'outline' as const, label: 'Partial' },
      paid: { variant: 'default' as const, label: 'Paid' },
    };

    const config = variants[paymentStatus];

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSatDeskName = (satDeskId: string) => {
    const desk = satDesks.find((d) => d.id === satDeskId);
    return desk ? desk.name : 'Unknown';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
              <ShoppingBag className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl">Device Sales</h1>
              <p className="text-sm text-muted-foreground">
                Manage permanent device sales and customer accounts
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBulkAssignmentOpen(true)}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Bulk Assign User
            </Button>
            <Button
              onClick={() => navigate('/sales/new')}
              className="bg-gradient-to-r from-primary to-accent gap-2"
            >
              <Plus className="h-4 w-4" />
              New Sale
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardDescription>
              <CardTitle className="text-3xl">{pendingSales.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Awaiting activation</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Activated
              </CardDescription>
              <CardTitle className="text-3xl">{activatedSales.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Active devices</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Total Devices
              </CardDescription>
              <CardTitle className="text-3xl">{totalDevicesSold}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Devices sold</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Revenue
              </CardDescription>
              <CardTitle className="text-3xl">${totalRevenue.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Total sales</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Sales History</CardTitle>
            <CardDescription>View and manage all device sales</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Sales ({sales.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pendingSales.length})</TabsTrigger>
                <TabsTrigger value="activated">Activated ({activatedSales.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedSales.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <SalesTable sales={sales} onViewDetails={handleViewDetails} getSatDeskName={getSatDeskName} getStatusBadge={getStatusBadge} getPaymentBadge={getPaymentBadge} />
              </TabsContent>
              <TabsContent value="pending" className="mt-4">
                <SalesTable sales={pendingSales} onViewDetails={handleViewDetails} getSatDeskName={getSatDeskName} getStatusBadge={getStatusBadge} getPaymentBadge={getPaymentBadge} />
              </TabsContent>
              <TabsContent value="activated" className="mt-4">
                <SalesTable sales={activatedSales} onViewDetails={handleViewDetails} getSatDeskName={getSatDeskName} getStatusBadge={getStatusBadge} getPaymentBadge={getPaymentBadge} />
              </TabsContent>
              <TabsContent value="completed" className="mt-4">
                <SalesTable sales={completedSales} onViewDetails={handleViewDetails} getSatDeskName={getSatDeskName} getStatusBadge={getStatusBadge} getPaymentBadge={getPaymentBadge} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Sale Details</DialogTitle>
              <DialogDescription>Sale #{selectedSale?.saleNumber}</DialogDescription>
            </DialogHeader>
            {selectedSale && (
              <div className="space-y-4">
                {/* Status & Payment */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">Status</span>
                    {getStatusBadge(selectedSale.status)}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm font-medium">Payment</span>
                    {getPaymentBadge(selectedSale.paymentStatus)}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Customer Information
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedSale.customer.firstName} {selectedSale.customer.lastName}
                      </span>
                    </div>
                    {selectedSale.customer.companyName && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{selectedSale.customer.companyName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedSale.customer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedSale.customer.phone}</span>
                    </div>
                    {selectedSale.customer.billingAddress && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="text-right">
                          {selectedSale.customer.billingAddress.street},{' '}
                          {selectedSale.customer.billingAddress.city},{' '}
                          {selectedSale.customer.billingAddress.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Devices */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 font-semibold flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Devices ({selectedSale.devices.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedSale.devices.map((device, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-md border bg-muted/30 p-2"
                      >
                        <div>
                          <p className="font-medium text-sm">{device.model}</p>
                          <p className="text-xs text-muted-foreground">
                            IMEI: {device.imei}
                          </p>
                        </div>
                        <Badge variant="outline">{device.serialNumber}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sale Details */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 font-semibold">Sale Details</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SatDesk:</span>
                      <span className="font-medium">{getSatDeskName(selectedSale.satDeskId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sale Date:</span>
                      <span>{new Date(selectedSale.saleDate).toLocaleDateString()}</span>
                    </div>
                    {selectedSale.activationDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Activation Date:</span>
                        <span>{new Date(selectedSale.activationDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedSale.totalAmount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Amount:</span>
                        <span className="font-medium">
                          ${selectedSale.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedSale.garminUsername && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Garmin Username:</span>
                        <span>{selectedSale.garminUsername}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedSale.notes && (
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h4 className="mb-2 font-semibold text-sm">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedSale.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <div className="flex gap-2">
                {selectedSale?.status === 'pending' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSale(selectedSale.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                {selectedSale?.status === 'pending' && (
                  <Button
                    onClick={() => {
                      handleActivateSale(selectedSale.id);
                      setIsDetailOpen(false);
                    }}
                  >
                    Activate Sale
                  </Button>
                )}
                {selectedSale?.status === 'activated' && (
                  <Button
                    onClick={() => {
                      handleCompleteSale(selectedSale.id);
                      setIsDetailOpen(false);
                    }}
                  >
                    Mark Complete
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk User Assignment Dialog */}
        <BulkUserAssignment
          isOpen={isBulkAssignmentOpen}
          onOpenChange={setIsBulkAssignmentOpen}
        />
      </div>
    </AppLayout>
  );
}

// Reusable table component
function SalesTable({
  sales,
  onViewDetails,
  getSatDeskName,
  getStatusBadge,
  getPaymentBadge,
}: {
  sales: DeviceSale[];
  onViewDetails: (sale: DeviceSale) => void;
  getSatDeskName: (id: string) => string;
  getStatusBadge: (status: DeviceSale['status']) => JSX.Element;
  getPaymentBadge: (payment: DeviceSale['paymentStatus']) => JSX.Element;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sale #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Devices</TableHead>
          <TableHead>SatDesk</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center">
              No sales found
            </TableCell>
          </TableRow>
        ) : (
          sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-mono text-sm">{sale.saleNumber}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {sale.customer.firstName} {sale.customer.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{sale.customer.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm">{sale.customer.companyName || '-'}</p>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{sale.devices.length} device(s)</Badge>
              </TableCell>
              <TableCell>
                <p className="text-sm">{getSatDeskName(sale.satDeskId)}</p>
              </TableCell>
              <TableCell>
                <p className="font-medium">
                  {sale.totalAmount ? `$${sale.totalAmount.toFixed(2)}` : '-'}
                </p>
              </TableCell>
              <TableCell>{getStatusBadge(sale.status)}</TableCell>
              <TableCell>{getPaymentBadge(sale.paymentStatus)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onViewDetails(sale)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
