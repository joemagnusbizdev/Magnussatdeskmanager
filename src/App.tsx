import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DeviceTable } from '@/components/dashboard/DeviceTable';
import { Button } from '@/components/ui/button';
import { useSatDeskStore } from '@/stores/satDeskStore';
import { mockDevices } from '@/data/mockDevices';
import {
  Smartphone,
  Clock,
  Users as UsersIcon,
  Archive as ArchiveIcon,
  ArrowRight,
  Plus,
  Building2,
} from 'lucide-react';
import Index from '@/pages/Index';
import NewRental from '@/pages/NewRental';
import Devices from '@/pages/Devices';
import DeviceDetailPage from '@/pages/DeviceDetailPage';
import Orders from '@/pages/Orders';
import CustomerPortal from '@/pages/CustomerPortal';
import Archive from '@/pages/Archive';
import SatDesks from '@/pages/SatDesks';
import SatDeskDetail from '@/pages/SatDeskDetail';
import Settings from '@/pages/Settings';
import Calendar from '@/pages/Calendar';
import Users from '@/pages/Users';
import Sales from '@/pages/Sales';
import NewSale from '@/pages/NewSale';
import CustomerServiceDashboard from '@/pages/CustomerServiceDashboard';
import RentalIntake from '@/pages/RentalIntake';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedSatDeskId, satDesks } = useSatDeskStore();

  const selectedDesk = satDesks.find((sd) => sd.id === selectedSatDeskId);

  // Filter devices by selected SatDesk
  const filteredDevices = selectedSatDeskId
    ? mockDevices.filter((d) => d.satDeskId === selectedSatDeskId)
    : mockDevices;

  const activeDevices = filteredDevices.filter((d) => d.status === 'active').length;
  const pendingDevices = filteredDevices.filter((d) => d.status === 'pending').length;
  const archivedDevices = filteredDevices.filter((d) => d.status === 'archived').length;
  const totalUsers = filteredDevices.filter((d) => d.user).length;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text font-bold text-transparent">
                Dashboard
              </h1>
              {selectedDesk && (
                <span className="flex items-center gap-2 rounded-full border-2 border-accent/20 bg-gradient-to-r from-accent/10 to-primary/10 px-4 py-1.5 font-semibold text-accent shadow-md backdrop-blur-sm">
                  <Building2 className="h-4 w-4" />
                  {selectedDesk.name}
                </span>
              )}
            </div>
            <p className="mt-2 text-muted-foreground">
              {selectedDesk
                ? `Monitoring ${selectedDesk.name} devices`
                : 'Monitor and manage your inReach device fleet'}
            </p>
          </div>
          <Button 
            variant="default" 
            onClick={() => navigate('/new-rental')}
            className="bg-gradient-to-r from-primary to-accent font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Rental
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Devices"
            value={activeDevices}
            icon={<Smartphone className="h-5 w-5 text-primary-foreground" />}
            trend="Currently in field"
            variant="accent"
          />
          <StatCard
            title="Pending Setup"
            value={pendingDevices}
            icon={<Clock className="h-5 w-5 text-orange-600" />}
            trend="Awaiting activation"
            variant="warning"
          />
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={<UsersIcon className="h-5 w-5 text-success" />}
            trend="Across all rentals"
            variant="success"
          />
          <StatCard
            title="Archived"
            value={archivedDevices}
            icon={<ArchiveIcon className="h-5 w-5 text-muted-foreground" />}
            trend="Completed rentals"
          />
        </div>

        {/* Recent Devices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-foreground">Recent Devices</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/devices')}
              className="font-semibold text-primary hover:bg-purple-100 hover:text-primary"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <DeviceTable devices={filteredDevices.filter((d) => d.status !== 'archived')} />
        </div>
      </div>
    </AppLayout>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-rental" element={<NewRental />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/device/:id" element={<DeviceDetailPage />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customer-portal" element={<CustomerPortal />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/sat-desks" element={<SatDesks />} />
        <Route path="/sat-desk/:id" element={<SatDeskDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/users" element={<Users />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales/new" element={<NewSale />} />
        <Route path="/cs-dashboard" element={<CustomerServiceDashboard />} />
        <Route path="/rental-intake" element={<RentalIntake />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}