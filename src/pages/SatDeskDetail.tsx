import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSatDeskStore } from '@/stores/satDeskStore';
import { mockDevices } from '@/data/mockDevices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ArrowLeft, Building2, Users, Smartphone, Activity, MapPin, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SatDeskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { satDesks } = useSatDeskStore();

  const satDesk = satDesks.find((sd) => sd.id === id);
  const devices = mockDevices.filter((d) => d.satDeskId === id);

  if (!satDesk) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Building2 className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 font-bold">SatDesk Not Found</h2>
          <p className="mb-6 text-muted-foreground">
            The SatDesk you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/sat-desks')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to SatDesks
          </Button>
        </div>
      </AppLayout>
    );
  }

  const activeDevices = devices.filter((d) => d.status === 'active');
  const pendingDevices = devices.filter((d) => d.status === 'pending');
  const assignedUsers = devices.filter((d) => d.user).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/sat-desks')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold',
                  'gradient-accent text-accent-foreground'
                )}
              >
                {satDesk.number}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl">{satDesk.name}</h1>
                  <Badge variant={satDesk.isActive ? 'default' : 'secondary'}>
                    {satDesk.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {satDesk.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </CardDescription>
              <CardTitle className="text-2xl">{satDesk.location}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Total Devices
              </CardDescription>
              <CardTitle className="text-2xl">
                {devices.length} / {satDesk.deviceQuota}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-accent transition-all"
                  style={{
                    width: `${(devices.length / satDesk.deviceQuota) * 100}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Active Devices
              </CardDescription>
              <CardTitle className="text-2xl text-success">
                {activeDevices.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {pendingDevices.length} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Assigned Users
              </CardDescription>
              <CardTitle className="text-2xl">{assignedUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {devices.length - assignedUsers} unassigned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Garmin Account Info */}
        {satDesk.garminAccountId && (
          <Card>
            <CardHeader>
              <CardTitle>Garmin Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Account ID</span>
                <span className="font-mono text-sm">{satDesk.garminAccountId}</span>
              </div>
              {satDesk.garminUsername && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Username</span>
                  <span className="font-mono text-sm">@{satDesk.garminUsername}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Devices Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Devices</CardTitle>
            <CardDescription>
              {devices.length} device{devices.length !== 1 ? 's' : ''} assigned to this
              SatDesk
            </CardDescription>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
                <Smartphone className="mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground">No devices assigned</p>
                <p className="text-sm text-muted-foreground">
                  Devices will appear here when assigned to this SatDesk
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rental Period</TableHead>
                    <TableHead>Last Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{device.deviceName}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {device.imei}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={device.status} />
                      </TableCell>
                      <TableCell>
                        {device.user ? (
                          <div>
                            <p className="font-medium">
                              {device.user.firstName} {device.user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {device.user.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(device.rentalStart).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">
                            to {new Date(device.rentalEnd).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {device.lastContact ? (
                          <span className="text-sm">
                            {new Date(device.lastContact).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/device/${device.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
