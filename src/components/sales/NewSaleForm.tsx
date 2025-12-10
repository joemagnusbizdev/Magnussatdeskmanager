import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalesStore, type SaleCustomer } from '@/stores/salesStore';
import { useSatDeskStore } from '@/stores/satDeskStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner@2.0.3';
import { Building2, Plus, Trash2, User, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DeviceEntry {
  imei: string;
  serialNumber: string;
  model: string;
}

export function NewSaleForm() {
  const navigate = useNavigate();
  const { addSale } = useSalesStore();
  const { satDesks } = useSatDeskStore();

  const [customer, setCustomer] = useState<SaleCustomer>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companyVAT: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  });

  const [devices, setDevices] = useState<DeviceEntry[]>([
    { imei: '', serialNumber: '', model: 'inReach Mini 2' },
  ]);

  const [satDeskId, setSatDeskId] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalAmount, setTotalAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [garminUsername, setGarminUsername] = useState('');

  const addDevice = () => {
    setDevices([...devices, { imei: '', serialNumber: '', model: 'inReach Mini 2' }]);
  };

  const removeDevice = (index: number) => {
    if (devices.length > 1) {
      setDevices(devices.filter((_, i) => i !== index));
    }
  };

  const updateDevice = (index: number, field: keyof DeviceEntry, value: string) => {
    const updated = [...devices];
    updated[index] = { ...updated[index], [field]: value };
    setDevices(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone) {
      toast.error('Please fill in all required customer fields');
      return;
    }

    if (!satDeskId) {
      toast.error('Please select a SatDesk');
      return;
    }

    if (devices.some((d) => !d.imei || !d.serialNumber)) {
      toast.error('Please fill in all device information');
      return;
    }

    const saleNumber = `SALE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    addSale({
      saleNumber,
      customer,
      devices,
      satDeskId,
      saleDate,
      status: 'pending',
      paymentStatus: 'pending',
      totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
      notes: notes || undefined,
      garminUsername: garminUsername || undefined,
    });

    toast.success('Sale created successfully!', {
      description: `Sale ${saleNumber} has been created`,
    });

    navigate('/sales');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
          <CardDescription>Enter customer and company details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={customer.firstName}
                onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={customer.lastName}
                onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">
                Phone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={customer.companyName}
                onChange={(e) => setCustomer({ ...customer, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="companyVAT">Company VAT/Tax ID</Label>
              <Input
                id="companyVAT"
                value={customer.companyVAT}
                onChange={(e) => setCustomer({ ...customer, companyVAT: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="street">Billing Address - Street</Label>
            <Input
              id="street"
              value={customer.billingAddress?.street}
              onChange={(e) =>
                setCustomer({
                  ...customer,
                  billingAddress: { ...customer.billingAddress!, street: e.target.value },
                })
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={customer.billingAddress?.city}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    billingAddress: { ...customer.billingAddress!, city: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={customer.billingAddress?.state}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    billingAddress: { ...customer.billingAddress!, state: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={customer.billingAddress?.postalCode}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    billingAddress: { ...customer.billingAddress!, postalCode: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={customer.billingAddress?.country}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    billingAddress: { ...customer.billingAddress!, country: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Device Information
          </CardTitle>
          <CardDescription>Add devices for this sale</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.map((device, index) => (
            <div key={index} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-medium">Device {index + 1}</h4>
                {devices.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDevice(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor={`imei-${index}`}>
                    IMEI <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`imei-${index}`}
                    value={device.imei}
                    onChange={(e) => updateDevice(index, 'imei', e.target.value)}
                    placeholder="300434063456789"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`serial-${index}`}>
                    Serial Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`serial-${index}`}
                    value={device.serialNumber}
                    onChange={(e) => updateDevice(index, 'serialNumber', e.target.value)}
                    placeholder="GM-XXX-001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`model-${index}`}>
                    Model <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={device.model}
                    onValueChange={(value) => updateDevice(index, 'model', value)}
                  >
                    <SelectTrigger id={`model-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inReach Mini 2">inReach Mini 2</SelectItem>
                      <SelectItem value="inReach Messenger">inReach Messenger</SelectItem>
                      <SelectItem value="inReach Explorer+">inReach Explorer+</SelectItem>
                      <SelectItem value="GPSMAP 66i">GPSMAP 66i</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addDevice} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Another Device
          </Button>
        </CardContent>
      </Card>

      {/* Sale Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Sale Details
          </CardTitle>
          <CardDescription>SatDesk assignment and additional information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="satDesk">
                SatDesk Assignment <span className="text-destructive">*</span>
              </Label>
              <Select value={satDeskId} onValueChange={setSatDeskId} required>
                <SelectTrigger id="satDesk">
                  <SelectValue placeholder="Select a SatDesk" />
                </SelectTrigger>
                <SelectContent>
                  {satDesks.map((desk) => (
                    <SelectItem key={desk.id} value={desk.id}>
                      {desk.name} ({desk.number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="saleDate">Sale Date</Label>
              <Input
                id="saleDate"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="totalAmount">Total Amount (USD)</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="garminUsername">Garmin Username</Label>
              <Input
                id="garminUsername"
                value={garminUsername}
                onChange={(e) => setGarminUsername(e.target.value)}
                placeholder="customer_username"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information about this sale..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => navigate('/sales')}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          Create Sale
        </Button>
      </div>
    </form>
  );
}
