import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// Import step components from CORRECT locations
import { RentalDatesStep } from '@/components/workflows/steps/RentalDatesStep';
import { DeviceAssignmentStep } from '@/components/workflows/steps/DeviceAssignmentStep';
import { ActivationStep } from '@/components/workflows/steps/ActivationStep';
import { ReviewConfirmationStep, ReviewData } from '@/components/workflows/steps/ReviewConfirmationStep';

// Import API service - FIXED: Use getOrderById (not fetchOrderById)
import { getOrderById, Order } from '@/services/api/orders';

interface FormData {
  // Customer info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Rental dates
  startDate: string;
  endDate: string;
  duration: number;
  rentalAmount: number;
  
  // Devices
  deviceIds: string[];
  
  // Order info
  orderId?: string;
  orderNumber?: string;
}

export default function Rentalintake() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get URL parameters
  const sourceParam = searchParams.get('source') || '';
  const orderIdParam = searchParams.get('orderid') || '';
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [orderLoaded, setOrderLoaded] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    duration: 0,
    rentalAmount: 0,
    deviceIds: [],
    orderId: orderIdParam,
    orderNumber: ''
  });

  // Load order data from API when orderid is in URL
  useEffect(() => {
    const loadOrderData = async () => {
      if (!orderIdParam || orderLoaded) return;
      
      console.log('🔄 Loading order data for orderid:', orderIdParam);
      setIsLoadingOrder(true);
      
      try {
        const orderData: Order = await getOrderById(orderIdParam);
        
        console.log('✅ Order data loaded:', orderData);
        
        // Extract customer name from billing or customer_name field
        const firstName = orderData.billing_address?.first_name || orderData.customer_name?.split(' ')[0] || '';
        const lastName = orderData.billing_address?.last_name || orderData.customer_name?.split(' ').slice(1).join(' ') || '';
        
        // Pre-fill form with order data
        setFormData(prev => ({
          ...prev,
          firstName,
          lastName,
          email: orderData.customer_email || '',
          phone: orderData.customer_phone || '',
          startDate: orderData.rental_start_date || '',
          endDate: orderData.rental_end_date || '',
          orderId: orderData.id,
          orderNumber: orderData.woocommerce_order_id
        }));
        
        setOrderLoaded(true);
        
      } catch (error) {
        console.error('❌ Failed to load order:', error);
      } finally {
        setIsLoadingOrder(false);
      }
    };
    
    if (orderIdParam && sourceParam === 'website') {
      loadOrderData();
    }
  }, [orderIdParam, sourceParam, orderLoaded]);

  // Step definitions for website orders
  const steps = [
    { number: 1, name: 'Rental Dates', completed: false },
    { number: 2, name: 'Assign Device', completed: false },
    { number: 3, name: 'Review', completed: false },
    { number: 4, name: 'Activate', completed: false }
  ];

  // Update handlers
  const handleDatesChange = (startDate: string, endDate: string, duration: number, amount: number) => {
    console.log('📅 Dates changed:', { startDate, endDate, duration, amount });
    
    setFormData(prev => ({
      ...prev,
      startDate,
      endDate,
      duration,
      rentalAmount: amount
    }));
  };

  const handleDevicesAssigned = (deviceIds: string[]) => {
    console.log('📱 Devices assigned:', deviceIds);
    
    setFormData(prev => ({
      ...prev,
      deviceIds
    }));
    
    // Auto-advance to review step
    setCurrentStep(3);
  };

  const handleReviewComplete = () => {
    console.log('✅ Review complete, moving to activation');
    setCurrentStep(4);
  };

  const handleActivationComplete = (success: boolean) => {
    console.log('🎉 Activation complete:', success);
    
    if (success) {
      // Show success and redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/cs-dashboard');
      }, 2000);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Prepare review data
  const reviewData: Partial<ReviewData> = {
    customer: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone
    },
    rental: {
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: formData.duration,
      rentalAmount: formData.rentalAmount
    },
    devices: formData.deviceIds.map(id => ({
      id,
      imei: 'Loading...',
      deviceNumber: 'Loading...',
      status: 'assigned'
    })),
    payment: {
      method: 'credit_card',
      status: 'paid'
    },
    order: formData.orderId ? {
      orderId: formData.orderId,
      orderNumber: formData.orderNumber || '',
      source: 'website'
    } : undefined
  };

  // Prepare activation props
  const activationDevices = formData.deviceIds.map((id, index) => ({
    deviceId: id,
    deviceName: `Device ${index + 1}`,
    imei: 'Loading...'
  }));

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <RentalDatesStep
              initialStartDate={formData.startDate}
              initialEndDate={formData.endDate}
              onDatesChange={handleDatesChange}
            />
            
            {/* Navigation Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!formData.startDate || !formData.endDate}
              >
                Next: Assign Device
              </Button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <DeviceAssignmentStep
              rentalType="individual"
              deviceCount={1}
              startDate={formData.startDate}
              endDate={formData.endDate}
              onDevicesAssigned={handleDevicesAssigned}
            />
            
            {/* Navigation Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={formData.deviceIds.length === 0}
              >
                Next: Review
              </Button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <ReviewConfirmationStep
              data={reviewData}
              onEdit={(section) => {
                console.log('Edit section:', section);
                // Navigate back to relevant step
                if (section === 'rental') setCurrentStep(1);
                if (section === 'devices') setCurrentStep(2);
              }}
              onComplete={handleReviewComplete}
            />
            
            {/* Back Button */}
            <div className="flex justify-start pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
              >
                Back
              </Button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <ActivationStep
            devices={activationDevices}
            customerEmail={formData.email}
            onActivationComplete={handleActivationComplete}
          />
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">New Rental</h1>
        <p className="text-muted-foreground">
          {orderIdParam 
            ? `Processing order #${formData.orderNumber || orderIdParam}` 
            : 'Create a new rental'}
        </p>
      </div>

      {/* Loading State */}
      {isLoadingOrder && (
        <Alert className="border-blue-500 bg-blue-50">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Loading order data...
          </AlertDescription>
        </Alert>
      )}

      {/* Order Loaded Alert */}
      {orderLoaded && !isLoadingOrder && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Order data loaded!</strong> Customer information has been pre-filled for you.
          </AlertDescription>
        </Alert>
      )}

      {/* Progress Stepper */}
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>
            Step {currentStep} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
          
          <div className="flex justify-between">
            {steps.map((step) => (
              <div 
                key={step.number}
                className="flex flex-col items-center"
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  ${currentStep === step.number 
                    ? 'bg-blue-600 text-white' 
                    : currentStep > step.number
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'}
                `}>
                  {currentStep > step.number ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`
                  text-xs mt-2 text-center
                  ${currentStep === step.number ? 'font-semibold text-blue-600' : 'text-muted-foreground'}
                `}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          {orderIdParam && currentStep === 1 && (
            <Badge variant="outline" className="w-fit">
              Order #{formData.orderNumber || orderIdParam}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}
