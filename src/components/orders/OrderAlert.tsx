import { useEffect, useState } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, CheckCircle2, Package, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function OrderAlert() {
  const { orders, unreadOrderCount } = useOrderStore();
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const navigate = useNavigate();

  // Get pending orders that haven't been dismissed
  const pendingOrders = orders.filter(
    (order) => order.status === 'pending' && !dismissed.includes(order.id)
  );

  const hasNewOrders = pendingOrders.length > 0 && visible;
  const completeOrders = pendingOrders.filter((o) => o.dataComplete);
  const incompleteOrders = pendingOrders.filter((o) => !o.dataComplete);

  const handleDismiss = (orderId: string) => {
    setDismissed([...dismissed, orderId]);
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders?highlight=${orderId}`);
    handleDismiss(orderId);
  };

  if (!hasNewOrders) return null;

  return (
    <div className="space-y-2">
      {/* Complete Orders - Ready to Process */}
      {completeOrders.map((order) => (
        <Alert
          key={order.id}
          className="border-green-200 bg-green-50 animate-in slide-in-from-top-5"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1 space-y-2">
              <AlertTitle className="text-green-900">
                New Order Ready to Process!
              </AlertTitle>
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-green-300 bg-white">
                      {order.orderNumber}
                    </Badge>
                    <span>
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </span>
                    <Badge className="gap-1 bg-green-600">
                      <Package className="h-3 w-3" />
                      Complete Data
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span>✓ Customer info</span>
                    <span>•</span>
                    <span>✓ Emergency contact</span>
                    <span>•</span>
                    <span>✓ Preset messages</span>
                  </div>
                  <p className="text-sm font-semibold">
                    Ready to assign IMEI and ship!
                  </p>
                </div>
              </AlertDescription>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={() => handleViewOrder(order.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Process Order
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDismiss(order.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDismiss(order.id)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}

      {/* Incomplete Orders - Need Escalation */}
      {incompleteOrders.map((order) => (
        <Alert
          key={order.id}
          variant="destructive"
          className="animate-in slide-in-from-top-5"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <div className="flex-1 space-y-2">
              <AlertTitle>Order Needs Attention!</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-white">
                      {order.orderNumber}
                    </Badge>
                    <span>
                      {order.customerInfo.firstName} {order.customerInfo.lastName}
                    </span>
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Incomplete Data
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">Missing information:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {order.missingFields?.map((field) => (
                        <li key={field}>
                          {field === 'phone' && 'Customer phone number'}
                          {field === 'emergencyContact.name' && 'Emergency contact name'}
                          {field === 'emergencyContact.phone' && 'Emergency contact phone'}
                          {field === 'presetMessages' && 'Preset messages'}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm font-semibold">
                    Requires manual follow-up with customer
                  </p>
                </div>
              </AlertDescription>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleViewOrder(order.id)}
                >
                  Review Order
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDismiss(order.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDismiss(order.id)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}
