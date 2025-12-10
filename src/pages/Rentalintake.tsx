/**
 * Rental Intake Page
 * Handles all 4 rental types with pre-filled data from various sources
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { RentalIntakeWizard } from '@/components/workflows/RentalIntakeWizard';
import { getWebsiteOrder, ProcessedWebhookOrder } from '@/services/api/webhooks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle } from 'lucide-react';

type RentalSource = 'website' | 'phone-individual' | 'phone-b2b' | 'b2b-bulk';

export default function RentalIntake() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<ProcessedWebhookOrder | null>(null);

  // Get parameters from URL
  const source = searchParams.get('source') as RentalSource || 'phone-individual';
  const orderId = searchParams.get('orderId');

  // Fetch order data if orderId is provided
  useEffect(() => {
    if (orderId) {
      fetchOrderData(orderId);
    }
  }, [orderId]);

  const fetchOrderData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the order from API
      const order = await getWebsiteOrder(id);
      setOrderData(order);
    } catch (err) {
      console.error('Failed to fetch order:', err);
      setError('Failed to load order data. You can still proceed manually.');
      // Don't block the user - they can still fill in manually
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (rentalData: any) => {
    console.log('Rental completed:', rentalData);
    // TODO: Submit to backend
    
    // Navigate to success page or back to dashboard
    navigate('/cs-dashboard');
  };

  const handleCancel = () => {
    navigate('/cs-dashboard');
  };

  // Show loading state
  if (loading && !orderData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading order data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message for Pre-filled Data */}
        {orderData && !loading && (
          <Alert className="border-green-500 bg-green-50">
            <AlertDescription className="text-green-700">
              ✅ Order data loaded! Customer information has been pre-filled for you.
            </AlertDescription>
          </Alert>
        )}

        {/* Rental Intake Wizard */}
        <RentalIntakeWizard
          source={source}
          initialData={orderData ? convertOrderToInitialData(orderData) : undefined}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    </AppLayout>
  );
}

/**
 * Convert webhook order data to wizard initial data format
 */
function convertOrderToInitialData(order: ProcessedWebhookOrder): any {
  return {
    // Order information
    order: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      source: order.source,
    },

    // Customer information (pre-filled)
    customer: {
      firstName: order.customer.firstName,
      lastName: order.customer.lastName,
      email: order.customer.email,
      phone: order.customer.phone,
      dateOfBirth: order.customer.dateOfBirth,
      idPassport: order.customer.idPassport,
      emergencyContacts: order.customer.emergencyContacts || [],
    },

    // Rental dates (pre-filled)
    rental: {
      startDate: order.rental.startDate,
      endDate: order.rental.endDate,
      duration: order.rental.duration,
      deviceCount: order.rental.deviceCount,
      rentalAmount: order.rental.estimatedAmount,
    },

    // Payment information (pre-filled)
    payment: {
      method: order.payment.method,
      status: order.payment.status,
      amount: order.payment.amount,
    },

    // Devices (to be assigned by CS rep)
    devices: [],
  };
}
