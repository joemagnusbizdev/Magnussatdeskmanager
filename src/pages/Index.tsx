import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DeviceTable } from '@/components/dashboard/DeviceTable';
import { mockDevices } from '@/data/mockDevices';
import { useSatDeskStore } from '@/stores/satDeskStore';
import { Activity, Users, Clock, Archive } from 'lucide-react';
import { useMemo } from 'react';

export default function Index() {
  const { selectedSatDeskId } = useSatDeskStore();

  // Filter devices based on selected SatDesk
  const filteredDevices = useMemo(() => {
    if (!selectedSatDeskId) {
      return mockDevices;
    }
    return mockDevices.filter((device) => device.satDeskId === selectedSatDeskId);
  }, [selectedSatDeskId]);

  // Calculate stats
  const activeDevices = filteredDevices.filter((d) => d.status === 'active').length;
  const pendingDevices = filteredDevices.filter((d) => d.status === 'pending').length;
  const archivedDevices = filteredDevices.filter((d) => d.status === 'archived').length;
  const totalUsers = filteredDevices.filter((d) => d.user).length;

  // Get recent devices (active and pending, sorted by rental start)
  const recentDevices = filteredDevices
    .filter((d) => d.status === 'active' || d.status === 'pending')
    .sort((a, b) => new Date(b.rentalStart).getTime() - new Date(a.rentalStart).getTime())
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your satellite device fleet and rental operations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Devices"
            value={activeDevices}
            description="Currently deployed in field"
            icon={Activity}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Pending Setup"
            value={pendingDevices}
            description="Awaiting customer pickup"
            icon={Clock}
            trend={{ value: 5, isPositive: false }}
          />
          <StatCard
            title="Active Users"
            value={totalUsers}
            description="Customers with devices"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Archived"
            value={archivedDevices}
            description="Completed rentals"
            icon={Archive}
          />
        </div>

        {/* Recent Devices Table */}
        <div>
          <DeviceTable devices={recentDevices} title="Recent Rentals" />
        </div>
      </div>
    </AppLayout>
  );
}
