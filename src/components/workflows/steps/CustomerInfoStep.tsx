import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, User, Mail, Phone, CreditCard, AlertCircle } from 'lucide-react';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  idPassport: string;
  emergencyContacts: EmergencyContact[];
}

interface CustomerInfoStepProps {
  initialData?: Partial<CustomerInfo>;
  onDataChange: (data: CustomerInfo) => void;
}

export function CustomerInfoStep({ initialData, onDataChange }: CustomerInfoStepProps) {
  const [formData, setFormData] = useState<CustomerInfo>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    idPassport: initialData?.idPassport || '',
    emergencyContacts: initialData?.emergencyContacts || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof CustomerInfo, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onDataChange(updated);
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addEmergencyContact = () => {
    const newContact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: '',
      phone: '',
      relationship: '',
    };
    updateField('emergencyContacts', [...formData.emergencyContacts, newContact]);
  };

  const updateEmergencyContact = (id: string, field: keyof EmergencyContact, value: string) => {
    const updated = formData.emergencyContacts.map(contact =>
      contact.id === id ? { ...contact, [field]: value } : contact
    );
    updateField('emergencyContacts', updated);
  };

  const removeEmergencyContact = (id: string) => {
    updateField('emergencyContacts', formData.emergencyContacts.filter(c => c.id !== id));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^[\d\s\-\+\(\)]+$/.test(phone);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Customer Information</h3>
        <p className="text-sm text-muted-foreground">
          Collect customer details for device rental
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Details
          </CardTitle>
          <CardDescription>Basic customer information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Smith"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.smith@example.com"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                onBlur={() => {
                  if (formData.email && !validateEmail(formData.email)) {
                    setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
                  }
                }}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                onBlur={() => {
                  if (formData.phone && !validatePhone(formData.phone)) {
                    setErrors(prev => ({ ...prev, phone: 'Invalid phone format' }));
                  }
                }}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* ID Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className={errors.dateOfBirth ? 'border-red-500' : ''}
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-red-500">{errors.dateOfBirth}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idPassport" className="flex items-center gap-2">
                <CreditCard className="h-3 w-3" />
                ID / Passport Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="idPassport"
                placeholder="A1234567"
                value={formData.idPassport}
                onChange={(e) => updateField('idPassport', e.target.value)}
                className={errors.idPassport ? 'border-red-500' : ''}
              />
              {errors.idPassport && (
                <p className="text-xs text-red-500">{errors.idPassport}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Emergency Contacts</CardTitle>
              <CardDescription>At least one contact required</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addEmergencyContact}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.emergencyContacts.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No emergency contacts added. Click "Add Contact" to add at least one.
              </AlertDescription>
            </Alert>
          ) : (
            formData.emergencyContacts.map((contact, index) => (
              <Card key={contact.id} className="border-2">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Contact {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEmergencyContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          placeholder="Jane Doe"
                          value={contact.name}
                          onChange={(e) => updateEmergencyContact(contact.id, 'name', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Phone</Label>
                        <Input
                          placeholder="+1 (555) 987-6543"
                          value={contact.phone}
                          onChange={(e) => updateEmergencyContact(contact.id, 'phone', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Relationship</Label>
                        <Input
                          placeholder="Spouse, Parent, Friend"
                          value={contact.relationship}
                          onChange={(e) => updateEmergencyContact(contact.id, 'relationship', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Validation Summary */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Required fields:</strong> All fields marked with * must be filled.
          At least one emergency contact is required.
        </AlertDescription>
      </Alert>
    </div>
  );
}
