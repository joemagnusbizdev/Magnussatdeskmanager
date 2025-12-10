import { AppLayout } from '@/components/layout/AppLayout';
import { NewRentalForm } from '@/components/forms/NewRentalForm';
import { PlusCircle } from 'lucide-react';

export default function NewRental() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <PlusCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1>Create New Rental</h1>
            <p className="text-muted-foreground">
              Set up a new device rental and configure preset messages
            </p>
          </div>
        </div>

        <NewRentalForm />
      </div>
    </AppLayout>
  );
}