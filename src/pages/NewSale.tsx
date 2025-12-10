import { AppLayout } from '@/components/layout/AppLayout';
import { NewSaleForm } from '@/components/sales/NewSaleForm';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NewSale() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/sales')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
              <ShoppingBag className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl">New Device Sale</h1>
              <p className="text-sm text-muted-foreground">
                Create a new permanent device sale record
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <NewSaleForm />
      </div>
    </AppLayout>
  );
}
