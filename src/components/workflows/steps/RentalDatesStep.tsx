import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { addDays, differenceInDays, format, parseISO } from 'date-fns';

interface RentalDatesStepProps {
  initialStartDate?: string;
  initialEndDate?: string;
  onDatesChange: (startDate: string, endDate: string) => void;
}

export function RentalDatesStep({
  initialStartDate,
  initialEndDate,
  onDatesChange
}: RentalDatesStepProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(initialStartDate || today);
  const [endDate, setEndDate] = useState(initialEndDate || format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate rental duration and pricing
  const rentalDays = startDate && endDate 
    ? differenceInDays(parseISO(endDate), parseISO(startDate)) + 1
    : 0;

  // Pricing calculation (example rates)
  const dailyRate = 15; // $15 per day
  const weeklyRate = 90; // $90 per week (discount)
  const monthlyRate = 300; // $300 per month (bigger discount)

  const calculatePrice = () => {
    if (rentalDays <= 0) return 0;
    if (rentalDays >= 30) return Math.ceil(rentalDays / 30) * monthlyRate;
    if (rentalDays >= 7) return Math.floor(rentalDays / 7) * weeklyRate + (rentalDays % 7) * dailyRate;
    return rentalDays * dailyRate;
  };

  const totalPrice = calculatePrice();

  useEffect(() => {
    // Validate dates
    const newErrors: Record<string, string> = {};

    if (startDate < today) {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    if (endDate < startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (rentalDays > 365) {
      newErrors.endDate = 'Rental period cannot exceed 365 days';
    }

    setErrors(newErrors);

    // Notify parent if valid
    if (Object.keys(newErrors).length === 0 && startDate && endDate) {
      onDatesChange(startDate, endDate);
    }
  }, [startDate, endDate]);

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    
    // Auto-adjust end date if it's now invalid
    if (endDate && date > endDate) {
      setEndDate(format(addDays(parseISO(date), 7), 'yyyy-MM-dd'));
    }
  };

  const quickSelectDuration = (days: number) => {
    const start = parseISO(startDate);
    const end = format(addDays(start, days - 1), 'yyyy-MM-dd');
    setEndDate(end);
  };

  const isValid = Object.keys(errors).length === 0 && rentalDays > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Rental Period</h3>
        <p className="text-sm text-muted-foreground">
          Select rental start and end dates
        </p>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Select Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-xs text-red-500">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-xs text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div>
            <Label className="text-xs text-muted-foreground">Quick Select:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                onClick={() => quickSelectDuration(7)}
                className="rounded-md border px-3 py-1 text-sm hover:bg-muted transition-colors"
              >
                1 Week
              </button>
              <button
                onClick={() => quickSelectDuration(14)}
                className="rounded-md border px-3 py-1 text-sm hover:bg-muted transition-colors"
              >
                2 Weeks
              </button>
              <button
                onClick={() => quickSelectDuration(30)}
                className="rounded-md border px-3 py-1 text-sm hover:bg-muted transition-colors"
              >
                1 Month
              </button>
              <button
                onClick={() => quickSelectDuration(60)}
                className="rounded-md border px-3 py-1 text-sm hover:bg-muted transition-colors"
              >
                2 Months
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rental Summary */}
      {isValid && (
        <Card className="border-2 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Rental Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Duration */}
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white p-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="text-lg font-bold">{rentalDays} days</div>
                  {rentalDays >= 7 && (
                    <div className="text-xs text-muted-foreground">
                      ({Math.floor(rentalDays / 7)} week{Math.floor(rentalDays / 7) !== 1 ? 's' : ''})
                    </div>
                  )}
                </div>
              </div>

              {/* Start Date */}
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white p-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Start Date</div>
                  <div className="font-semibold">
                    {format(parseISO(startDate), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(parseISO(startDate), 'EEEE')}
                  </div>
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-white p-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">End Date</div>
                  <div className="font-semibold">
                    {format(parseISO(endDate), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(parseISO(endDate), 'EEEE')}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Estimated Total</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${totalPrice}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${dailyRate}/day base rate
                  </div>
                </div>
              </div>

              {/* Discount Badge */}
              {rentalDays >= 30 && (
                <Badge className="mt-2 bg-green-600">
                  Monthly discount applied!
                </Badge>
              )}
              {rentalDays >= 7 && rentalDays < 30 && (
                <Badge className="mt-2 bg-blue-600">
                  Weekly discount applied!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Pricing:</strong> Daily ($15), Weekly ($90), Monthly ($300).
          Device must be returned by 5 PM on the end date.
        </AlertDescription>
      </Alert>
    </div>
  );
}
