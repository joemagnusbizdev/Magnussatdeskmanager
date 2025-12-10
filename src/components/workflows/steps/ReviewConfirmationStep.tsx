import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Calendar, 
  Smartphone, 
  CreditCard,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Building2
} from 'lucide-react';

export interface ReviewData {
  // Customer Information
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    idPassport?: string;
    emergencyContacts?: Array<{
      name: string;
      relationship: string;
      phone: string;
    }>;
  };
  
  // Rental Information
  rental: {
    startDate: string;
    endDate: string;
    duration: number;
    rentalAmount: number;
    depositAmount?: number;
  };
  
  // Device Information
  devices: Array<{
    id: string;
    imei: string;
    deviceNumber: string;
    status: string;
  }>;
  
  // Payment Information
  payment: {
    method: 'credit_card' | 'cash' | 'invoice';
    status: string;
    cardLast4?: string;
    depositCollected?: boolean;
  };
  
  // Order Information (optional)
  order?: {
    orderId: string;
    orderNumber: string;
    source: string;
  };
}

interface ReviewConfirmationStepProps {
  data: Partial<ReviewData>;
  onEdit?: (section: string) => void;
  onComplete: () => void;
  isLoading?: boolean;
}

export const ReviewConfirmationStep: React.FC<ReviewConfirmationStepProps> = ({ 
  data, 
  onEdit, 
  onComplete,
  isLoading = false 
}) => {
  const { customer, rental, devices = [], payment, order } = data;
  
  // Validation checks
  const hasCustomerInfo = customer && customer.firstName && customer.lastName && customer.email && customer.phone;
  const hasRentalDates = rental && rental.startDate && rental.endDate;
  const hasDevices = devices && devices.length > 0;
  const hasPaymentInfo = payment && payment.method && payment.status;
  
  const isComplete = hasCustomerInfo && hasRentalDates && hasDevices && hasPaymentInfo;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review & Confirm</h2>
        <p className="text-gray-600 mt-1">
          Please review all information before completing the rental activation.
        </p>
      </div>

      {/* Validation Status Alert */}
      {!isComplete && (
        <Alert className="border-2 border-amber-500 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-900 font-semibold">
            Missing Information
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            Please complete all required sections before activating:
            <ul className="list-disc list-inside mt-2 space-y-1">
              {!hasCustomerInfo && <li>Customer Information</li>}
              {!hasRentalDates && <li>Rental Dates</li>}
              {!hasDevices && <li>Device Assignment</li>}
              {!hasPaymentInfo && <li>Payment Processing</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Status Alert */}
      {isComplete && (
        <Alert className="border-2 border-green-500 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900 font-semibold">
            Ready to Activate
          </AlertTitle>
          <AlertDescription className="text-green-700">
            All information verified. Click Complete and Activate to:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Activate devices in Garmin system</li>
              <li>Sync customer data to Command Center</li>
              <li>Send confirmation email to customer</li>
              <li>Mark rental as active in system</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Order Information (if from website/B2B order) */}
      {order && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Order Information
              </CardTitle>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {order.source}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-xs">{order.orderId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Customer Information
            </CardTitle>
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit('customer')}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasCustomerInfo ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-semibold">{customer.firstName} {customer.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date of Birth</p>
                  <p className="font-semibold">{customer.dateOfBirth || 'Not provided'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{customer.phone}</span>
                </div>
                {customer.idPassport && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">ID/Passport:</span>
                    <span className="font-semibold">{customer.idPassport}</span>
                  </div>
                )}
              </div>
              
              {customer.emergencyContacts && customer.emergencyContacts.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Emergency Contacts</p>
                    <div className="space-y-2">
                      {customer.emergencyContacts.map((contact, idx) => (
                        <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                          <p className="font-semibold">{contact.name}</p>
                          <p className="text-gray-600 text-xs">
                            {contact.relationship} • {contact.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No customer information provided</p>
          )}
        </CardContent>
      </Card>

      {/* Rental Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Rental Period
            </CardTitle>
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit('rental')}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasRentalDates ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Start Date</p>
                  <p className="font-semibold">{formatDate(rental.startDate)}</p>
                </div>
                <div>
                  <p className="text-gray-600">End Date</p>
                  <p className="font-semibold">{formatDate(rental.endDate)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold">{rental.duration} days</span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rental Amount:</span>
                  <span className="font-semibold">{formatCurrency(rental.rentalAmount)}</span>
                </div>
                {rental.depositAmount && rental.depositAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Security Deposit:</span>
                    <span className="font-semibold">{formatCurrency(rental.depositAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-lg text-blue-600">
                    {formatCurrency(rental.rentalAmount + (rental.depositAmount || 0))}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No rental dates selected</p>
          )}
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Assigned Devices ({devices.length})
            </CardTitle>
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit('devices')}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasDevices ? (
            <div className="space-y-2">
              {devices.map((device, idx) => (
                <div key={device.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{device.deviceNumber}</p>
                      <p className="text-xs text-gray-600">IMEI: {device.imei}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {device.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No devices assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              Payment Information
            </CardTitle>
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit('payment')}>
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasPaymentInfo ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold capitalize">
                  {payment.method.replace('_', ' ')}
                  {payment.cardLast4 && ` •••• ${payment.cardLast4}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Status:</span>
                <Badge 
                  variant={payment.status === 'paid' ? 'default' : 'outline'}
                  className={payment.status === 'paid' ? 'bg-green-600' : ''}
                >
                  {payment.status}
                </Badge>
              </div>
              {payment.depositCollected !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deposit Collected:</span>
                  <span className="font-semibold">
                    {payment.depositCollected ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No payment information provided</p>
          )}
        </CardContent>
      </Card>

      {/* Complete Button */}
      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          onClick={onComplete}
          disabled={!isComplete || isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Complete & Activate
            </>
          )}
        </Button>
      </div>
    </div>
  );
};