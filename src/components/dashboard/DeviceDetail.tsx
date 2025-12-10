import { Device } from '@/types/device';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  User,
  Phone,
  Mail,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Edit,
  Archive,
  Send,
} from 'lucide-react';

interface DeviceDetailProps {
  device: Device;
}

export function DeviceDetail({ device }: DeviceDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1>{device.deviceName}</h1>
            <StatusBadge status={device.status} />
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">IMEI: {device.imei}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {device.status === 'active' && (
            <Button variant="outline" size="sm">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          )}
          <Button variant="default" size="sm" className="bg-gradient-to-r from-primary to-accent font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <Send className="mr-2 h-4 w-4" />
            Push to Command
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Information */}
        <Card className="animate-fade-in border-2 border-border/50 bg-white/70 shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {device.user ? (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="font-semibold">
                    {device.user.firstName} {device.user.lastName}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      <Mail className="mr-1 inline h-3 w-3" /> Email
                    </p>
                    <p className="text-sm">{device.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      <Phone className="mr-1 inline h-3 w-3" /> Phone
                    </p>
                    <p className="text-sm">{device.user.phone}</p>
                  </div>
                </div>
                {device.user.emergencyContact && (
                  <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm font-medium text-destructive">
                      <AlertTriangle className="mr-1 inline h-4 w-4" /> Emergency Contact
                    </p>
                    <p className="mt-1 font-semibold">{device.user.emergencyContact}</p>
                    <p className="text-sm">{device.user.emergencyPhone}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No user assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Rental Details */}
        <Card className="animate-fade-in border-2 border-border/50 bg-white/70 shadow-lg backdrop-blur-sm" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Rental Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                <p className="font-semibold">
                  {new Date(device.rentalStart).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">End Date</p>
                <p className="font-semibold">
                  {new Date(device.rentalEnd).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            {device.garminLogin && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Garmin Explore Login</p>
                <p className="font-mono text-sm">{device.garminLogin}</p>
              </div>
            )}
            {device.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="rounded-lg bg-muted p-3 text-sm">{device.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preset Messages */}
        <Card className="animate-fade-in border-2 border-border/50 bg-white/70 shadow-lg backdrop-blur-sm lg:col-span-2" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              Preset Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {device.presetMessages.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {device.presetMessages.map((preset) => (
                  <div
                    key={preset.id}
                    className="rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                      {preset.slot}
                    </div>
                    <p className="text-sm">{preset.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No preset messages configured</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
