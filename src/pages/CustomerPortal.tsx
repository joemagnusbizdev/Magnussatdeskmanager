import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useOrderStore } from '@/stores/orderStore';
import { Radio, CheckCircle2, User, MapPin, Calendar, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CustomerPortal() {
  const { addOrder } = useOrderStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // Customer Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Trip Details
    tripDestination: '',
    tripDuration: 7,
    startDate: '',
    endDate: '',
    experienceLevel: 'beginner' as 'beginner' | 'intermediate' | 'expert',
    needsTraining: false,
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    // Preferences
    deviceType: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.tripDestination
    ) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Create order
    addOrder({
      orderNumber: `MAG-${Date.now()}`,
      customerInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      },
      preferences: {
        tripDestination: formData.tripDestination,
        tripDuration: formData.tripDuration,
        experienceLevel: formData.experienceLevel,
        needsTraining: formData.needsTraining,
        emergencyContact: formData.emergencyName
          ? {
              name: formData.emergencyName,
              phone: formData.emergencyPhone,
              relationship: formData.emergencyRelationship,
            }
          : undefined,
      },
      rentalDetails: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        deviceType: formData.deviceType,
      },
      source: 'portal',
      notes: formData.notes,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Rental Request Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you! Our team will process your rental request and contact you within 24
              hours to confirm your device assignment and provide pickup instructions.
            </p>
            <div className="rounded-lg border bg-muted/30 p-4 mb-6">
              <p className="text-sm font-medium mb-1">Check your email</p>
              <p className="text-sm text-muted-foreground">
                We've sent a confirmation to <strong>{formData.email}</strong>
              </p>
            </div>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl gradient-accent">
              <Radio className="h-8 w-8 text-accent-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 gradient-text">Magnus inReach Rental</h1>
          <p className="text-muted-foreground">
            Complete your rental preferences to help us prepare the perfect device for your
            adventure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Personal Information
              </CardTitle>
              <CardDescription>Your contact details for this rental</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Trip Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Trip Details
              </CardTitle>
              <CardDescription>Tell us about your adventure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destination">
                  Destination <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="destination"
                  value={formData.tripDestination}
                  onChange={(e) => setFormData({ ...formData, tripDestination: e.target.value })}
                  placeholder="e.g., Denali National Park, Alaska"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <RadioGroup
                  value={formData.experienceLevel}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, experienceLevel: value })
                  }
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 rounded-lg border p-3">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner" className="cursor-pointer">
                      Beginner
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-3">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="cursor-pointer">
                      Intermediate
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-3">
                    <RadioGroupItem value="expert" id="expert" />
                    <Label htmlFor="expert" className="cursor-pointer">
                      Expert
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Device Training Session</Label>
                  <p className="text-sm text-muted-foreground">
                    Request a 30-minute training session before your trip
                  </p>
                </div>
                <Switch
                  checked={formData.needsTraining}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, needsTraining: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Emergency Contact
              </CardTitle>
              <CardDescription>Someone we can contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Full Name</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  placeholder="Jane Smith"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Phone Number</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyPhone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4568"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={formData.emergencyRelationship}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyRelationship: e.target.value })
                    }
                    placeholder="Spouse, Parent, etc."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Device Preferences
              </CardTitle>
              <CardDescription>Optional preferences for your rental</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceType">Preferred Device Type</Label>
                <Select
                  value={formData.deviceType}
                  onValueChange={(value) => setFormData({ ...formData, deviceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No preference</SelectItem>
                    <SelectItem value="inReach Mini 2">inReach Mini 2</SelectItem>
                    <SelectItem value="inReach Messenger">inReach Messenger</SelectItem>
                    <SelectItem value="inReach Explorer+">inReach Explorer+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special requests or information we should know..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Card className="border-2 border-accent/20 bg-accent/5">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Ready to submit your rental request?</p>
                  <p className="text-sm text-muted-foreground">
                    We'll review and contact you within 24 hours
                  </p>
                </div>
                <Button type="submit" size="lg" className="gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Submit Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
