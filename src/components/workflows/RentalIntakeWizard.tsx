/**
 * Rental Intake Wizard - UPDATED WITH STEP INTEGRATION
 * Guided step-by-step workflow for customer service representatives
 * Handles all 4 rental types with intelligent routing
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  Phone,
  Users,
  Building2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react';

// Import all step components
import { CustomerInfoStep } from './steps/CustomerInfoStep';
import { RentalDatesStep } from './steps/RentalDatesStep';
import { DeviceAssignmentStep } from './steps/DeviceAssignmentStep';
import { PaymentProcessingStep } from './steps/PaymentProcessingStep';
import { OrderSearchStep } from './steps/OrderSearchStep';
import { ReviewConfirmationStep } from './steps/ReviewConfirmationStep';
import { ActivationStep } from './steps/ActivationStep';

export type RentalSource = 'website' | 'phone-individual' | 'phone-b2b' | 'b2b-bulk';

interface RentalIntakeWizardProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

interface Step {
  id: string;
  title: string;
  description: string;
  component: string;
}

export function RentalIntakeWizard({ onComplete, onCancel }: RentalIntakeWizardProps) {
  const [rentalSource, setRentalSource] = useState<RentalSource | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    customer: {},
    rental: {},
    devices: [],
    payment: {},
    order: null,
  });

  // Step definitions based on rental source
  const getSteps = (source: RentalSource): Step[] => {
    switch (source) {
      case 'website':
        return [
          { id: 'order', title: 'Find Order', description: 'Locate website order', component: 'OrderSearchStep' },
          { id: 'verify', title: 'Verify Details', description: 'Confirm customer & dates', component: 'VerifyStep' },
          { id: 'assign', title: 'Assign Devices', description: 'Auto-assign available devices', component: 'DeviceAssignmentStep' },
          { id: 'review', title: 'Review', description: 'Final verification', component: 'ReviewConfirmationStep' },
          { id: 'activate', title: 'Activate', description: 'Send to Command Center', component: 'ActivationStep' },
        ];
      
      case 'phone-individual':
        return [
          { id: 'customer', title: 'Customer Info', description: 'Collect customer details', component: 'CustomerInfoStep' },
          { id: 'dates', title: 'Rental Period', description: 'Select dates & duration', component: 'RentalDatesStep' },
          { id: 'assign', title: 'Assign Device', description: 'Select available device', component: 'DeviceAssignmentStep' },
          { id: 'payment', title: 'Payment', description: 'Process payment', component: 'PaymentProcessingStep' },
          { id: 'review', title: 'Review', description: 'Final verification', component: 'ReviewConfirmationStep' },
          { id: 'activate', title: 'Activate', description: 'Send to Command Center', component: 'ActivationStep' },
        ];
      
      case 'phone-b2b':
        return [
          { id: 'customer', title: 'Company Info', description: 'Select or create company', component: 'CustomerInfoStep' },
          { id: 'dates', title: 'Rental Period', description: 'Select dates & duration', component: 'RentalDatesStep' },
          { id: 'devices', title: 'Device Quantity', description: 'How many devices needed?', component: 'DeviceAssignmentStep' },
          { id: 'payment', title: 'Payment', description: 'Process payment', component: 'PaymentProcessingStep' },
          { id: 'review', title: 'Review', description: 'Final verification', component: 'ReviewConfirmationStep' },
          { id: 'activate', title: 'Activate All', description: 'Send to Command Center', component: 'ActivationStep' },
        ];
      
      case 'b2b-bulk':
        return [
          { id: 'order', title: 'Find Order', description: 'Locate B2B order', component: 'OrderSearchStep' },
          { id: 'verify', title: 'Verify Details', description: 'Confirm company & quantities', component: 'VerifyStep' },
          { id: 'assign', title: 'Bulk Assign', description: 'Auto-assign all devices', component: 'DeviceAssignmentStep' },
          { id: 'review', title: 'Review', description: 'Final check before activation', component: 'ReviewConfirmationStep' },
          { id: 'activate', title: 'Activate All', description: 'Send to Command Center', component: 'ActivationStep' },
        ];
      
      default:
        return [];
    }
  };

  const steps = rentalSource ? getSteps(rentalSource) : [];

  // Update form data handlers
  const updateCustomerData = (data: any) => {
    setFormData((prev: any) => ({ ...prev, customer: data }));
  };

  const updateRentalDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const rentalAmount = duration * 15; // $15/day

    setFormData((prev: any) => ({
      ...prev,
      rental: {
        startDate,
        endDate,
        duration,
        rentalAmount,
      },
    }));
  };

  const updateDevices = (deviceIds: string[]) => {
    // Mock device data - in real app, fetch from API
    const mockDeviceData = deviceIds.map((id, index) => ({
      deviceId: id,
      deviceName: `inReach Mini 2 - Device ${index + 1}`,
      imei: `30043406347245${index}`,
      deviceNumber: index + 1,
    }));
    
    setFormData((prev: any) => ({ ...prev, devices: mockDeviceData }));
  };

  const updatePayment = (paymentInfo: any) => {
    setFormData((prev: any) => ({ ...prev, payment: paymentInfo }));
  };

  const updateOrder = (order: any) => {
    setFormData((prev: any) => ({
      ...prev,
      order: {
        orderNumber: order.orderNumber,
        source: order.source,
      },
      customer: {
        firstName: order.customerName.split(' ')[0],
        lastName: order.customerName.split(' ')[1] || '',
        email: order.customerEmail,
        phone: order.customerPhone,
        dateOfBirth: '',
        idPassport: '',
        emergencyContacts: [],
      },
      rental: {
        startDate: order.startDate,
        endDate: order.endDate,
        duration: Math.ceil((new Date(order.endDate).getTime() - new Date(order.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1,
        rentalAmount: order.totalAmount,
      },
    }));
  };

  // Render step content
  const renderStepContent = () => {
    if (!rentalSource || currentStep >= steps.length) return null;

    const step = steps[currentStep];

    switch (step.component) {
      case 'CustomerInfoStep':
        return (
          <CustomerInfoStep
            initialData={formData.customer}
            onDataChange={updateCustomerData}
          />
        );

      case 'RentalDatesStep':
        return (
          <RentalDatesStep
            initialStartDate={formData.rental.startDate}
            initialEndDate={formData.rental.endDate}
            onDatesChange={updateRentalDates}
          />
        );

      case 'DeviceAssignmentStep':
        return (
          <DeviceAssignmentStep
            rentalType={rentalSource === 'phone-individual' ? 'individual' : 'b2b'}
            deviceCount={rentalSource === 'phone-individual' ? 1 : formData.deviceCount || 1}
            startDate={formData.rental.startDate || new Date().toISOString().split('T')[0]}
            endDate={formData.rental.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            onDevicesAssigned={updateDevices}
          />
        );

      case 'PaymentProcessingStep':
        return (
          <PaymentProcessingStep
            rentalAmount={formData.rental.rentalAmount || 0}
            depositAmount={100}
            onPaymentComplete={updatePayment}
          />
        );

      case 'OrderSearchStep':
        return (
          <OrderSearchStep
            orderType={rentalSource === 'website' ? 'website' : 'b2b'}
            onOrderSelected={updateOrder}
          />
        );

      case 'ReviewConfirmationStep':
        return (
          <ReviewConfirmationStep
            data={{
              customer: formData.customer,
              rental: formData.rental,
              devices: formData.devices,
              payment: {
                ...formData.payment,
                depositAmount: 100,
                totalAmount: (formData.rental.rentalAmount || 0) + 100,
              },
              order: formData.order,
            }}
            onConfirm={() => {}}
          />
        );

      case 'ActivationStep':
        return (
          <ActivationStep
            devices={formData.devices}
            customerEmail={formData.customer.email || 'customer@example.com'}
            onActivationComplete={(success) => {
              if (success) {
                setTimeout(() => {
                  onComplete(formData);
                }, 2000);
              }
            }}
          />
        );

      case 'VerifyStep':
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Verify step - Customer data pre-filled from order. Review and confirm.
              <div className="mt-4 space-y-2">
                <div><strong>Customer:</strong> {formData.customer.firstName} {formData.customer.lastName}</div>
                <div><strong>Email:</strong> {formData.customer.email}</div>
                <div><strong>Dates:</strong> {formData.rental.startDate} to {formData.rental.endDate}</div>
              </div>
            </AlertDescription>
          </Alert>
        );

      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Step content for {step.id} goes here
            </AlertDescription>
          </Alert>
        );
    }
  };

  // Validation for next button
  const canProceed = () => {
    if (!rentalSource) return false;
    
    const step = steps[currentStep];
    
    switch (step.component) {
      case 'CustomerInfoStep':
        return formData.customer.firstName && 
               formData.customer.lastName && 
               formData.customer.email && 
               formData.customer.phone &&
               formData.customer.emergencyContacts?.length > 0;
      
      case 'RentalDatesStep':
        return formData.rental.startDate && formData.rental.endDate;
      
      case 'DeviceAssignmentStep':
        return formData.devices.length > 0;
      
      case 'PaymentProcessingStep':
        return formData.payment.depositPaid;
      
      case 'OrderSearchStep':
        return formData.order !== null;
      
      case 'ActivationStep':
        return false; // Can't manually proceed from activation
      
      default:
        return true;
    }
  };

  // Rental source selection
  if (!rentalSource) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">New Rental</h2>
          <p className="text-muted-foreground">Select where this rental is coming from</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Website Order */}
          <Card 
            className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary"
            onClick={() => setRentalSource('website')}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Website Order</CardTitle>
                    <CardDescription>From online booking</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">Auto</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Customer already in system</li>
                <li>• Payment processed</li>
                <li>• Quick activation</li>
              </ul>
            </CardContent>
          </Card>

          {/* Phone - Individual */}
          <Card 
            className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary"
            onClick={() => setRentalSource('phone-individual')}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Phone - Individual</CardTitle>
                    <CardDescription>Single customer call</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">Manual</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Collect customer details</li>
                <li>• Process payment</li>
                <li>• Assign single device</li>
              </ul>
            </CardContent>
          </Card>

          {/* Phone - B2B */}
          <Card 
            className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary"
            onClick={() => setRentalSource('phone-b2b')}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Phone - B2B</CardTitle>
                    <CardDescription>Business customer call</CardDescription>
                  </div>
                </div>
                <Badge variant="outline">Manual</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Company account setup</li>
                <li>• Multiple devices</li>
                <li>• Generate agreement</li>
              </ul>
            </CardContent>
          </Card>

          {/* B2B Bulk Order */}
          <Card 
            className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary"
            onClick={() => setRentalSource('b2b-bulk')}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>B2B Bulk Order</CardTitle>
                    <CardDescription>Large pre-paid order</CardDescription>
                  </div>
                </div>
                <Badge>Auto</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Pre-paid bulk order</li>
                <li>• User list import</li>
                <li>• Batch activation</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Tip:</strong> Website orders and B2B bulk orders are faster because customer data is already collected.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Workflow steps UI
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {rentalSource === 'website' && 'Website Order Processing'}
            {rentalSource === 'phone-individual' && 'Individual Rental'}
            {rentalSource === 'phone-b2b' && 'B2B Rental'}
            {rentalSource === 'b2b-bulk' && 'B2B Bulk Order'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 rounded-lg px-4 py-2 whitespace-nowrap ${
              index === currentStep 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : index < currentStep 
                ? 'bg-green-100 text-green-700'
                : 'bg-muted text-muted-foreground'
            }`}>
              {index < currentStep ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 text-xs font-bold">
                  {index + 1}
                </div>
              )}
              <div className="text-sm font-medium">{step.title}</div>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep]?.title}</CardTitle>
          <CardDescription>{steps[currentStep]?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0 || steps[currentStep]?.component === 'ActivationStep'}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </div>

        {currentStep < steps.length - 1 ? (
          <Button 
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={() => onComplete(formData)} 
            className="bg-green-600 hover:bg-green-700"
            disabled={steps[currentStep]?.component === 'ActivationStep'}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Complete
          </Button>
        )}
      </div>
    </div>
  );
}
