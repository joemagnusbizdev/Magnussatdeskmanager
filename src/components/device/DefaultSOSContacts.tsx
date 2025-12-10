import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Shield, Phone, Building2 } from 'lucide-react';

export const MAGNUS_ECC_CONTACT = {
  name: 'MAGNUS ECC',
  phone: '+972-3-MAGNUS1',
  email: 'ecc@magnus.co.il',
  description: 'Emergency Command Center - 24/7 Monitoring',
};

export const MAGNUS_EMERGENCY_CONTACT = {
  name: 'MAGNUS Emergency Response',
  phone: '+972-3-MAGNUS2',
  email: 'emergency@magnus.co.il',
  description: 'Primary Emergency Contact',
};

export function DefaultSOSContacts() {
  return (
    <Card className="border-2 border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Shield className="h-5 w-5 text-orange-600" />
          Default SOS Designees
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-300 bg-orange-100">
          <AlertTriangle className="h-4 w-4 text-orange-700" />
          <AlertTitle className="text-orange-900">Mandatory Safety Configuration</AlertTitle>
          <AlertDescription className="text-orange-800">
            All devices are pre-configured with MAGNUS emergency contacts. These cannot be removed
            and will always receive SOS alerts.
          </AlertDescription>
        </Alert>

        {/* MAGNUS ECC */}
        <div className="rounded-lg border-2 border-orange-300 bg-white p-4">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-orange-900">{MAGNUS_ECC_CONTACT.name}</p>
                <p className="text-xs text-orange-700">{MAGNUS_ECC_CONTACT.description}</p>
              </div>
            </div>
            <Badge className="bg-orange-600">Priority 1</Badge>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-orange-800">
              <Phone className="h-3 w-3" />
              <span className="font-mono">{MAGNUS_ECC_CONTACT.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-orange-800">
              <span className="text-xs">{MAGNUS_ECC_CONTACT.email}</span>
            </div>
          </div>
        </div>

        {/* MAGNUS Emergency Contact */}
        <div className="rounded-lg border-2 border-orange-300 bg-white p-4">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-orange-900">{MAGNUS_EMERGENCY_CONTACT.name}</p>
                <p className="text-xs text-orange-700">{MAGNUS_EMERGENCY_CONTACT.description}</p>
              </div>
            </div>
            <Badge className="bg-orange-600">Priority 2</Badge>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-orange-800">
              <Phone className="h-3 w-3" />
              <span className="font-mono">{MAGNUS_EMERGENCY_CONTACT.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-orange-800">
              <span className="text-xs">{MAGNUS_EMERGENCY_CONTACT.email}</span>
            </div>
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-sm text-blue-900">
            <strong>Auto-Sync:</strong> All active devices automatically connect to MAGNUS ECC for
            real-time monitoring and emergency response coordination.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
