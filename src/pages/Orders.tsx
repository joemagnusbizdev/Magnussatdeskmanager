import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useOrderStore, type RentalOrder } from '@/stores/orderStore';
import { mockDevices } from '@/data/mockDevices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { OrderAlert } from '@/components/orders/OrderAlert';
import { IMEIAssignmentDialog } from '@/components/orders/IMEIAssignmentDialog';
import { toast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Smartphone, 
  ArrowRight,
  AlertTriangle,
  Package,
  Truck,
  MessageSquare,
} from 'lucide-react';

export default function Orders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightedOrderId = searchParams.get('highlight');
  const {
    orders,
    processOrder,
    updateOrder,
    deleteOrder,
    markAsReadyToShip,
    markAsShipped,
    escalateOrder,
    markOrderAsRead,
  } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const processingOrders = orders.filter((o) => o.status === 'processing');
  const readyToShipOrders = orders.filter((o) => o.status === 'ready-to-ship');
  const shippedOrders = orders.filter((o) => o.status === 'shipped');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const escalatedOrders = orders.filter((o) => o.status === 'escalated');

  const availableDevices = mockDevices.filter(
    (d) => d.status === 'inactive' || d.status === 'available' || d.status === 'archived'
  );

  const handleViewDetails = (order: RentalOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleStartProcess = (order: RentalOrder) => {
    setSelectedOrder(order);
    markOrderAsRead(order.id); // Mark as read when opening
    setIsAssignmentOpen(true);
  };

  const handleAssignDevice = (orderId: string, deviceId: string, imei: string) => {
    processOrder(orderId, deviceId, imei);
    
    const order = orders.find((o) => o.id === orderId);
    
    toast({
      title: 'Device Assigned!',
      description: `IMEI ${imei} assigned to ${order?.customerInfo.firstName} ${order?.customerInfo.lastName}`,
    });

    setIsAssignmentOpen(false);
    
    // Navigate to device detail to complete setup
    navigate(`/device/${deviceId}`);
  };

  const handleMarkReadyToShip = (orderId: string) => {
    markAsReadyToShip(orderId);
    toast({
      title: 'Ready to Ship',
      description: 'Order marked as ready for shipment',
    });
  };

  const handleMarkShipped = (orderId: string) => {
    markAsShipped(orderId);
    toast({
      title: 'Order Shipped',
      description: 'Order has been shipped to customer',
    });
  };

  const handleEscalate = (orderId: string) => {
    const reason = prompt('Reason for escalation:');
    if (reason) {
      escalateOrder(orderId, reason);
      toast({
        title: 'Order Escalated',
        description: 'Order has been flagged for manual review',
        variant: 'destructive',
      });
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      updateOrder(orderId, { status: 'cancelled' });
      toast({
        title: 'Order Cancelled',
        description: 'The rental request has been cancelled.',
      });
      setIsDetailOpen(false);
    }
  };

  const getStatusBadge = (status: RentalOrder['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock },
      processing: { variant: 'default' as const, icon: ArrowRight },
      'ready-to-ship': { variant: 'outline' as const, icon: Package },
      shipped: { variant: 'outline' as const, icon: Truck },
      completed: { variant: 'outline' as const, icon: CheckCircle2 },
      cancelled: { variant: 'destructive' as const, icon: XCircle },
      escalated: { variant: 'destructive' as const, icon: AlertTriangle },
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

  const getSourceBadge = (source: RentalOrder['source']) => {
    const labels = {
      website: 'E-commerce',
      portal: 'Customer Portal',
      manual: 'Manual Entry',
    };
    return <Badge variant="outline">{labels[source]}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
            <ShoppingCart className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl">Rental Orders</h1>
            <p className="text-sm text-muted-foreground">
              Process incoming rental requests from customers
            </p>
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
              <CardTitle className="text-3xl">{pendingOrders.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Processing
              </CardDescription>
              <CardTitle className="text-3xl">{processingOrders.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Being prepared</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Ready to Ship
              </CardDescription>
              <CardTitle className="text-3xl">{readyToShipOrders.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Devices assigned</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipped
              </CardDescription>
              <CardTitle className="text-3xl">{shippedOrders.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Devices shipped</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completed
              </CardDescription>
              <CardTitle className="text-3xl">{completedOrders.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Devices assigned</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Orders</CardDescription>
              <CardTitle className="text-3xl">{orders.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>Recent rental requests from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No rental orders yet
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className={highlightedOrderId === order.id ? 'bg-accent/50' : ''}>
                      <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.customerInfo.firstName} {order.customerInfo.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.customerInfo.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{order.preferences.tripDestination}</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(order.rentalDetails.startDate).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">
                            to {new Date(order.rentalDetails.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getSourceBadge(order.source)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleStartProcess(order)}
                              className="gap-2"
                            >
                              <Smartphone className="h-4 w-4" />
                              Assign Device
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order #{selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                {/* Customer Info */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 font-semibold">Customer Information</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedOrder.customerInfo.firstName}{' '}
                        {selectedOrder.customerInfo.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedOrder.customerInfo.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedOrder.customerInfo.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 font-semibold">Trip Details</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destination:</span>
                      <span className="font-medium">
                        {selectedOrder.preferences.tripDestination}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{selectedOrder.preferences.tripDuration} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience:</span>
                      <Badge variant="outline">
                        {selectedOrder.preferences.experienceLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Needs Training:</span>
                      <span>{selectedOrder.preferences.needsTraining ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedOrder.preferences.emergencyContact && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <h4 className="mb-3 font-semibold text-orange-900">
                      Emergency Contact
                    </h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-orange-700">Name:</span>
                        <span className="font-medium text-orange-900">
                          {selectedOrder.preferences.emergencyContact.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-700">Phone:</span>
                        <span className="text-orange-900">
                          {selectedOrder.preferences.emergencyContact.phone}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-700">Relationship:</span>
                        <span className="text-orange-900">
                          {selectedOrder.preferences.emergencyContact.relationship}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              {selectedOrder?.status === 'pending' && (
                <Button
                  variant="destructive"
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                >
                  Cancel Order
                </Button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                {selectedOrder?.status === 'pending' && (
                  <Button onClick={() => {
                    setIsDetailOpen(false);
                    handleStartProcess(selectedOrder);
                  }}>
                    Assign Device
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* IMEI Assignment Dialog */}
        {selectedOrder && (
          <IMEIAssignmentDialog
            isOpen={isAssignmentOpen}
            onOpenChange={setIsAssignmentOpen}
            order={selectedOrder}
            availableDevices={availableDevices}
            onAssign={handleAssignDevice}
          />
        )}

        {/* Order Alerts - shown at top of page */}
        <div className="fixed top-20 right-4 z-50 w-96">
          <OrderAlert />
        </div>
      </div>
    </AppLayout>
  );
}