import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useSatDeskStore } from '@/stores/satDeskStore';
import { User, Smartphone, MessageSquare, Calendar, Plus, X, Building2, Users } from 'lucide-react';

interface PresetMessage {
  slot: number;
  message: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export function NewRentalForm() {
  const navigate = useNavigate();
  const { satDesks, selectedSatDeskId } = useSatDeskStore();
  const activeSatDesks = satDesks.filter((sd) => sd.isActive);

  const [selectedDesk, setSelectedDesk] = useState<string>(selectedSatDeskId || '');
  const [presetMessages, setPresetMessages] = useState<PresetMessage[]>([
    { slot: 1, message: '' },
  ]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: '', phone: '', relationship: '' },
    { id: '2', name: '', phone: '', relationship: '' },
  ]);

  const addPresetMessage = () => {
    if (presetMessages.length < 6) {
      setPresetMessages([...presetMessages, { slot: presetMessages.length + 1, message: '' }]);
    }
  };

  const removePresetMessage = (index: number) => {
    const updated = presetMessages.filter((_, i) => i !== index);
    setPresetMessages(updated.map((msg, i) => ({ ...msg, slot: i + 1 })));
  };

  const updatePresetMessage = (index: number, message: string) => {
    const updated = [...presetMessages];
    updated[index].message = message;
    setPresetMessages(updated);
  };

  const addEmergencyContact = () => {
    if (emergencyContacts.length < 4) {
      setEmergencyContacts([
        ...emergencyContacts,
        { id: Date.now().toString(), name: '', phone: '', relationship: '' },
      ]);
    }
  };

  const removeEmergencyContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter((contact) => contact.id !== id));
  };

  const updateEmergencyContact = (id: string, field: keyof EmergencyContact, value: string) => {
    setEmergencyContacts(
      emergencyContacts.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDesk) {
      toast({
        title: 'Select SatDesk',
        description: 'Please select a SatDesk for this rental.',
        variant: 'destructive',
      });
      return;
    }
    
    const deskName = satDesks.find((sd) => sd.id === selectedDesk)?.name;
    toast({
      title: 'Rental Created',
      description: `New device rental created in ${deskName}.`,
    });
    navigate('/devices');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SatDesk Selection */}
        <Card className="animate-fade-in border-2 border-border/50 bg-white/70 shadow-lg backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-accent" />
              SatDesk Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="satDesk">Assign to SatDesk *</Label>
              <Select value={selectedDesk} onValueChange={setSelectedDesk} required>
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue placeholder="Select a SatDesk" />
                </SelectTrigger>
                <SelectContent>
                  {activeSatDesks.map((satDesk) => (
                    <SelectItem key={satDesk.id} value={satDesk.id}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-accent font-semibold text-accent-foreground">
                          {satDesk.number}
                        </span>
                        <span>{satDesk.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Device will be managed under this Garmin Professional Account
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Device Information */}
        <Card className="animate-fade-in border-2 border-border/50 bg-white/70 shadow-lg backdrop-blur-sm" style={{ animationDelay: '50ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-accent" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imei">IMEI Number *</Label>
              <Input
                id="imei"
                placeholder="300434060XXXXXX"
                className="font-mono"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name *</Label>
              <Input id="deviceName" placeholder="inReach Mini 2 - Unit XXX" required />
            </div>
          </CardContent>
        </Card>

        {/* User Information */}
        <Card className="animate-fade-in border-2 border-border/50 bg-white/70 shadow-lg backdrop-blur-sm" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" placeholder="Doe" required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input id="dateOfBirth" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idPassport">ID/Passport # *</Label>
                <Input id="idPassport" placeholder="ID or Passport Number" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="john@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="animate-fade-in border-2 border-border/50 bg-white/70 shadow-lg backdrop-blur-sm" style={{ animationDelay: '125ms' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Emergency Contacts
              </CardTitle>
              {emergencyContacts.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmergencyContact}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add up to 4 emergency contacts (optional)
            </p>
            {emergencyContacts.map((contact, index) => (
              <div
                key={contact.id}
                className="rounded-lg border-2 border-border/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Contact #{index + 1}</span>
                  {emergencyContacts.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmergencyContact(contact.id)}
                      className="h-7 text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`contact-name-${contact.id}`}>Name</Label>
                    <Input
                      id={`contact-name-${contact.id}`}
                      placeholder="Jane Doe"
                      value={contact.name}
                      onChange={(e) => updateEmergencyContact(contact.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`contact-relationship-${contact.id}`}>Relationship</Label>
                    <Input
                      id={`contact-relationship-${contact.id}`}
                      placeholder="Spouse, Parent, etc."
                      value={contact.relationship}
                      onChange={(e) => updateEmergencyContact(contact.id, 'relationship', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`contact-phone-${contact.id}`}>Phone Number</Label>
                  <Input
                    id={`contact-phone-${contact.id}`}
                    type="tel"
                    placeholder="+1 (555) 987-6543"
                    value={contact.phone}
                    onChange={(e) => updateEmergencyContact(contact.id, 'phone', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rental Period */}
        <Card className="animate-fade-in border-2 border-border/50 bg-white/70 shadow-lg backdrop-blur-sm" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Rental Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="rentalStart">Start Date *</Label>
                <Input id="rentalStart" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalEnd">End Date *</Label>
                <Input id="rentalEnd" type="date" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Trip details, special requirements, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preset Messages */}
        <Card className="animate-fade-in border-2 border-border/50 bg-white/70 shadow-lg backdrop-blur-sm" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              Preset Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {presetMessages.map((preset, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                  {preset.slot}
                </div>
                <div className="flex-1">
                  <Input
                    placeholder={`Preset message ${preset.slot}`}
                    value={preset.message}
                    onChange={(e) => updatePresetMessage(index, e.target.value)}
                  />
                </div>
                {presetMessages.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePresetMessage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {presetMessages.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPresetMessage}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Preset Message
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-primary to-accent font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          Create Rental
        </Button>
      </div>
    </form>
  );
}