import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Calendar, 
  Package, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Order {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deviceCount: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed';
  source: 'website' | 'b2b';
  companyName?: string;
}

interface OrderSearchStepProps {
  orderType: 'website' | 'b2b';
  onOrderSelected: (order: Order) => void;
}

export function OrderSearchStep({ orderType, onOrderSelected }: OrderSearchStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock orders - TODO: Replace with real API call
  const mockOrders: Order[] = [
    {
      orderId: 'ord-001',
      orderNumber: 'WEB-2024-001',
      customerName: 'John Smith',
      customerEmail: 'john.smith@example.com',
      customerPhone: '+1 (555) 123-4567',
      deviceCount: 1,
      startDate: '2024-12-15',
      endDate: '2024-12-22',
      totalAmount: 120,
      status: 'pending',
      source: 'website',
    },
    {
      orderId: 'ord-002',
      orderNumber: 'WEB-2024-002',
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.j@example.com',
      customerPhone: '+1 (555) 234-5678',
      deviceCount: 2,
      startDate: '2024-12-16',
      endDate: '2024-12-30',
      totalAmount: 450,
      status: 'pending',
      source: 'website',
    },
    {
      orderId: 'ord-003',
      orderNumber: 'B2B-2024-001',
      customerName: 'Mike Davis',
      customerEmail: 'mike@adventuresinc.com',
      customerPhone: '+1 (555) 345-6789',
      deviceCount: 15,
      startDate: '2024-12-20',
      endDate: '2025-01-10',
      totalAmount: 3500,
      status: 'pending',
      source: 'b2b',
      companyName: 'Adventures Inc.',
    },
  ];

  const handleSearch = () => {
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const results = mockOrders.filter(order => {
        if (order.source !== orderType) return false;
        
        const query = searchQuery.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerEmail.toLowerCase().includes(query) ||
          order.companyName?.toLowerCase().includes(query)
        );
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 800);
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    onOrderSelected(order);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">
          {orderType === 'website' ? 'Find Website Order' : 'Find B2B Order'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Search by order number, customer name, or email
        </p>
      </div>

      {/* Search Box */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Orders
          </CardTitle>
          <CardDescription>
            Enter order number, customer name, email, or company name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder={orderType === 'website' 
                  ? "e.g., WEB-2024-001 or John Smith" 
                  : "e.g., B2B-2024-001 or Adventures Inc."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold">
            {searchResults.length} Order{searchResults.length !== 1 ? 's' : ''} Found
          </h4>
          
          {searchResults.map((order) => (
            <Card 
              key={order.orderId}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedOrder?.orderId === order.orderId 
                  ? 'border-2 border-primary bg-primary/5' 
                  : 'hover:border-primary'
              }`}
              onClick={() => handleSelectOrder(order)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Order Header */}
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-bold text-lg">{order.orderNumber}</div>
                        <Badge variant={order.status === 'pending' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">{order.customerName}</div>
                          {order.companyName && (
                            <div className="text-xs text-muted-foreground">{order.companyName}</div>
                          )}
                          <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">
                            {order.deviceCount} Device{order.deviceCount !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${order.totalAmount} total
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(order.startDate).toLocaleDateString()} - {new Date(order.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedOrder?.orderId === order.orderId && (
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchResults.length === 0 && searchQuery && !isSearching && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No orders found matching "{searchQuery}". Try a different search term.
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Order Confirmation */}
      {selectedOrder && (
        <Alert className="border-2 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong className="text-green-800">Order Selected!</strong>
            <br />
            {selectedOrder.orderNumber} - {selectedOrder.customerName}
            <br />
            Click "Next" to continue processing this order.
          </AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      {!searchQuery && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> You can search by:
            <ul className="list-disc list-inside mt-2 text-sm">
              <li>Order number (e.g., WEB-2024-001)</li>
              <li>Customer name (e.g., John Smith)</li>
              <li>Email address (e.g., john@example.com)</li>
              {orderType === 'b2b' && <li>Company name (e.g., Adventures Inc.)</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
