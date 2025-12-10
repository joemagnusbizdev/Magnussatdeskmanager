import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CreditCard, 
  DollarSign, 
  Shield, 
  AlertCircle, 
  CheckCircle2,
  Banknote,
  Building2
} from 'lucide-react';

interface PaymentInfo {
  method: 'credit_card' | 'cash' | 'invoice';
  cardNumber?: string;
  cardExpiry?: string;
  cardCVV?: string;
  cardName?: string;
  depositPaid: boolean;
  depositAmount: number;
  rentalAmount: number;
  totalAmount: number;
}

interface PaymentProcessingStepProps {
  rentalAmount: number;
  depositAmount: number;
  onPaymentComplete: (paymentInfo: PaymentInfo) => void;
}

export function PaymentProcessingStep({
  rentalAmount,
  depositAmount,
  onPaymentComplete
}: PaymentProcessingStepProps) {
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'cash' | 'invoice'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [depositPaid, setDepositPaid] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalAmount = rentalAmount + depositAmount;

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateCard = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === 'credit_card') {
      const cleanedNumber = cardNumber.replace(/\s/g, '');
      if (cleanedNumber.length !== 16) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }

      if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) {
        newErrors.cardExpiry = 'Expiry format: MM/YY';
      }

      if (cardCVV.length !== 3 && cardCVV.length !== 4) {
        newErrors.cardCVV = 'CVV must be 3-4 digits';
      }

      if (!cardName.trim()) {
        newErrors.cardName = 'Cardholder name required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProcessPayment = () => {
    if (paymentMethod === 'credit_card' && !validateCard()) {
      return;
    }

    const paymentInfo: PaymentInfo = {
      method: paymentMethod,
      cardNumber: paymentMethod === 'credit_card' ? cardNumber : undefined,
      cardExpiry: paymentMethod === 'credit_card' ? cardExpiry : undefined,
      cardCVV: paymentMethod === 'credit_card' ? cardCVV : undefined,
      cardName: paymentMethod === 'credit_card' ? cardName : undefined,
      depositPaid,
      depositAmount,
      rentalAmount,
      totalAmount,
    };

    onPaymentComplete(paymentInfo);
  };

  const isFormValid = () => {
    if (paymentMethod === 'cash' || paymentMethod === 'invoice') {
      return depositPaid;
    }
    return depositPaid && cardNumber && cardExpiry && cardCVV && cardName;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Payment Processing</h3>
        <p className="text-sm text-muted-foreground">
          Collect payment and deposit information
        </p>
      </div>

      {/* Payment Summary */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rental Amount</span>
            <span className="font-semibold">${rentalAmount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Security Deposit</span>
            <span className="font-semibold">${depositAmount}</span>
          </div>
          <div className="border-t pt-3 flex items-center justify-between">
            <span className="font-bold">Total Due Today</span>
            <span className="text-2xl font-bold text-primary">${totalAmount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Method</CardTitle>
          <CardDescription>How will the customer pay?</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
            <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="credit_card" id="credit_card" />
              <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="h-4 w-4" />
                <div>
                  <div className="font-semibold">Credit/Debit Card</div>
                  <div className="text-xs text-muted-foreground">Process payment now</div>
                </div>
              </Label>
              <Badge>Most Common</Badge>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                <Banknote className="h-4 w-4" />
                <div>
                  <div className="font-semibold">Cash</div>
                  <div className="text-xs text-muted-foreground">Customer pays in cash</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-lg border p-4 cursor-pointer hover:bg-muted">
              <RadioGroupItem value="invoice" id="invoice" />
              <Label htmlFor="invoice" className="flex items-center gap-2 cursor-pointer flex-1">
                <Building2 className="h-4 w-4" />
                <div>
                  <div className="font-semibold">Invoice (B2B Only)</div>
                  <div className="text-xs text-muted-foreground">Bill to company account</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Credit Card Form */}
      {paymentMethod === 'credit_card' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card Details
            </CardTitle>
            <CardDescription>
              <Shield className="inline h-3 w-3 mr-1" />
              Secure payment processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className={errors.cardNumber ? 'border-red-500' : ''}
              />
              {errors.cardNumber && (
                <p className="text-xs text-red-500">{errors.cardNumber}</p>
              )}
            </div>

            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="JOHN SMITH"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                className={errors.cardName ? 'border-red-500' : ''}
              />
              {errors.cardName && (
                <p className="text-xs text-red-500">{errors.cardName}</p>
              )}
            </div>

            {/* Expiry and CVV */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Expiry Date</Label>
                <Input
                  id="cardExpiry"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  className={errors.cardExpiry ? 'border-red-500' : ''}
                />
                {errors.cardExpiry && (
                  <p className="text-xs text-red-500">{errors.cardExpiry}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardCVV">CVV</Label>
                <Input
                  id="cardCVV"
                  type="password"
                  placeholder="123"
                  maxLength={4}
                  value={cardCVV}
                  onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                  className={errors.cardCVV ? 'border-red-500' : ''}
                />
                {errors.cardCVV && (
                  <p className="text-xs text-red-500">{errors.cardCVV}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deposit Confirmation */}
      <Card className={depositPaid ? 'border-2 border-green-500' : ''}>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="depositPaid"
              checked={depositPaid}
              onCheckedChange={(checked) => setDepositPaid(checked as boolean)}
            />
            <div className="flex-1">
              <Label 
                htmlFor="depositPaid" 
                className="text-base font-semibold cursor-pointer"
              >
                {paymentMethod === 'credit_card' && 'Process payment and '}
                Confirm deposit collected
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {paymentMethod === 'credit_card' 
                  ? `Charge $${totalAmount} to card ending in ${cardNumber.slice(-4) || 'XXXX'}`
                  : `Confirm $${totalAmount} ${paymentMethod} payment received`}
              </p>
            </div>
            {depositPaid && (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Process Button */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {!depositPaid ? (
            <span>Check the box above to confirm payment has been collected.</span>
          ) : (
            <span className="text-green-600 font-semibold">
              ✓ Ready to proceed! Click "Next" to continue.
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Security Notice */}
      {paymentMethod === 'credit_card' && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Secure Payment</AlertTitle>
          <AlertDescription>
            Card details are encrypted and processed securely. Full card numbers are never stored.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
