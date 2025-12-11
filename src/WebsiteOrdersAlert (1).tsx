import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Calendar,
  User,
  Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getWebsiteOrders, 
  ProcessedWebhookOrder,
  formatOrderForDisplay,
  MOCK_WEBSITE_ORDERS
} from '@/services/api/webhooks';

interface WebsiteOrdersAlertProps {
  maxDisplay?: number;
  showOnlyNew?: boolean;
}

export const WebsiteOrdersAlert: React.FC<WebsiteOrdersAlertProps> = ({ 
  maxDisplay = 5,
  showOnlyNew = true 
}) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ProcessedWebhookOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch website orders
  useEffect(() => {
    fetchOrders();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchOrders, 60000);
    return () => clearInterval(interval);
  }, [showOnlyNew]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API
      const fetchedOrders = await getWebsiteOrders(showOnlyNew ? 'new' : undefined);
      setOrders(fetchedOrders);
      setError(null);
    } catch (err) {
      // Fallback to mock data if API not available
      console.log('Using mock website orders (API not available)');
      const mockOrders = showOnlyNew 
        ? MOCK_WEBSITE_ORDERS.filter(o => o.status === 'new')
        : MOCK_WEBSITE_ORDERS;
      setOrders(mockOrders);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order: ProcessedWebhookOrder) => {
    // Navigate to rental intake with pre-filled data from order
    navigate(`/rental-intake?source=website&orderId=${order.id}`);
  };

  const newOrdersCount = orders.filter(o => o.status === 'new').length;
  
  if (loading && orders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return null; // Don't show if no orders
  }

  return (
    <Card className="border-2 border-blue-500 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-full p-2">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900">
                New Website Orders
              </CardTitle>
              <CardDescription className="text-blue-700">
                {newOrdersCount} {newOrdersCount === 1 ? 'order needs' : 'orders need'} processing
              </CardDescription>
            </div>
          </div>
          {newOrdersCount > 0 && (
            <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
              {newOrdersCount}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Order List */}
        {orders.slice(0, maxDisplay).map((order) => {
          const displayInfo = formatOrderForDisplay(order);
          const timeAgo = getTimeAgo(order.createdAt);
          
          return (
            <OrderCard
              key={order.id}
              order={order}
              displayInfo={displayInfo}
              timeAgo={timeAgo}
              onClick={() => handleOrderClick(order)}
            />
          );
        })}

        {/* Show More Button */}
        {orders.length > maxDisplay && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/orders?filter=website')}
          >
            View All {orders.length} Website Orders
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <StatBox 
            icon={<Clock className="h-4 w-4" />}
            label="Last 24h"
            value={orders.filter(o => 
              new Date(o.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length}
            color="blue"
          />
          <StatBox 
            icon={<Package className="h-4 w-4" />}
            label="Devices"
            value={orders.reduce((sum, o) => sum + o.rental.deviceCount, 0)}
            color="green"
          />
          <StatBox 
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Paid"
            value={orders.filter(o => o.payment.status === 'paid').length}
            color="purple"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

interface OrderCardProps {
  order: ProcessedWebhookOrder;
  displayInfo: ReturnType<typeof formatOrderForDisplay>;
  timeAgo: string;
  onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, displayInfo, timeAgo, onClick }) => {
  const urgencyColors = {
    high: 'border-red-500 bg-red-50',
    medium: 'border-amber-500 bg-amber-50',
    low: 'border-gray-200 bg-white',
  };

  const urgencyBadgeColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-amber-100 text-amber-700 border-amber-300',
    low: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  return (
    <div 
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${urgencyColors[displayInfo.urgency]}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{displayInfo.title}</h4>
            {displayInfo.urgency === 'high' && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                Urgent
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">{displayInfo.subtitle}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </div>

      {/* Details */}
      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(order.rental.startDate).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <Package className="h-3 w-3" />
          {order.rental.deviceCount} {order.rental.deviceCount === 1 ? 'device' : 'devices'}
        </span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
          {order.orderNumber}
        </Badge>
        <Badge 
          variant="outline" 
          className={`text-xs ${
            order.payment.status === 'paid' 
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-amber-100 text-amber-700 border-amber-300'
          }`}
        >
          {order.payment.status === 'paid' ? '✓ Paid' : 'Pending Payment'}
        </Badge>
        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-700 border-gray-300">
          ₪{order.payment.amount}
        </Badge>
      </div>
    </div>
  );
};

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple';
}

const StatBox: React.FC<StatBoxProps> = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-3 text-center`}>
      <div className="flex items-center justify-center mb-1">
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-75">{label}</div>
    </div>
  );
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default WebsiteOrdersAlert;