import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DeviceDetailEnhanced } from '@/components/dashboard/DeviceDetailEnhanced';
import { mockDevices } from '@/data/mockDevices';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Satellite } from 'lucide-react';

export function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const device = mockDevices.find((d) => d.id === id);

  if (!device) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Satellite className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 font-bold text-foreground">Device Not Found</h2>
          <p className="mb-6 text-muted-foreground">
            The device you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <DeviceDetailEnhanced device={device} />
      </div>
    </AppLayout>
  );
}