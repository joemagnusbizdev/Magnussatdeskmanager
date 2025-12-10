import { Building2, Plus, Edit, Trash2, MapPin, Users, Settings, Eye } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSatDeskStore, type SatDesk } from '@/stores/satDeskStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

export default function SatDesks() {
  const navigate = useNavigate();
  const { satDesks, addSatDesk, updateSatDesk, deleteSatDesk } = useSatDeskStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSatDesk, setEditingSatDesk] = useState<SatDesk | null>(null);
  const [formData, setFormData] = useState({
    number: 0,
    name: '',
    description: '',
    garminAccountId: '',
    garminUsername: '',
    garminPassword: '',
    garminApiToken: '',
    deviceQuota: 0,
    deviceCount: 0,
    isActive: true,
  });

  const handleOpenDialog = (satDesk?: SatDesk) => {
    if (satDesk) {
      setEditingSatDesk(satDesk);
      setFormData({
        number: satDesk.number,
        name: satDesk.name,
        description: satDesk.description,
        garminAccountId: satDesk.garminAccountId || '',
        garminUsername: satDesk.garminUsername || '',
        garminPassword: satDesk.garminPassword || '',
        garminApiToken: satDesk.garminApiToken || '',
        deviceQuota: satDesk.deviceQuota,
        deviceCount: satDesk.deviceCount,
        isActive: satDesk.isActive,
      });
    } else {
      setEditingSatDesk(null);
      const nextNumber = Math.max(...satDesks.map((sd) => sd.number), 0) + 1;
      setFormData({
        number: nextNumber,
        name: '',
        description: '',
        garminAccountId: '',
        garminUsername: '',
        garminPassword: '',
        garminApiToken: '',
        deviceQuota: 50,
        deviceCount: 0,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSatDesk(null);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (editingSatDesk) {
      updateSatDesk(editingSatDesk.id, formData);
      toast({
        title: 'SatDesk Updated',
        description: `${formData.name} has been successfully updated.`,
      });
    } else {
      addSatDesk(formData);
      toast({
        title: 'SatDesk Created',
        description: `${formData.name} has been successfully created.`,
      });
    }

    handleCloseDialog();
  };

  const handleDelete = (satDesk: SatDesk) => {
    if (satDesk.deviceCount > 0) {
      toast({
        title: 'Cannot Delete',
        description: 'This SatDesk has active devices. Please reassign them first.',
        variant: 'destructive',
      });
      return;
    }

    if (confirm(`Are you sure you want to delete ${satDesk.name}?`)) {
      deleteSatDesk(satDesk.id);
      toast({
        title: 'SatDesk Deleted',
        description: `${satDesk.name} has been removed.`,
      });
    }
  };

  const handleToggleActive = (satDesk: SatDesk) => {
    updateSatDesk(satDesk.id, { isActive: !satDesk.isActive });
    toast({
      title: satDesk.isActive ? 'SatDesk Deactivated' : 'SatDesk Activated',
      description: `${satDesk.name} is now ${satDesk.isActive ? 'inactive' : 'active'}.`,
    });
  };

  const activeSatDesks = satDesks.filter((sd) => sd.isActive);
  const totalDevices = satDesks.reduce((sum, sd) => sum + sd.deviceCount, 0);
  const totalQuota = satDesks.reduce((sum, sd) => sum + sd.deviceQuota, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
              <Building2 className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl">SatDesk Accounts</h1>
              <p className="text-sm text-muted-foreground">
                Manage Garmin Professional accounts and device allocations
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add SatDesk
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total SatDesks</CardDescription>
              <CardTitle className="text-3xl">{satDesks.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {activeSatDesks.length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Devices</CardDescription>
              <CardTitle className="text-3xl">{totalDevices}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {totalQuota} total quota
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Utilization</CardDescription>
              <CardTitle className="text-3xl">
                {totalQuota > 0 ? Math.round((totalDevices / totalQuota) * 100) : 0}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {totalQuota - totalDevices} available
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SatDesks Table */}
        <Card>
          <CardHeader>
            <CardTitle>All SatDesks</CardTitle>
            <CardDescription>
              Garmin professional accounts used for device management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Garmin Account</TableHead>
                  <TableHead>API Status</TableHead>
                  <TableHead>Devices</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {satDesks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No SatDesks found. Create your first one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  satDesks.map((satDesk) => (
                    <TableRow key={satDesk.id}>
                      <TableCell>
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold',
                            'bg-accent text-accent-foreground'
                          )}
                        >
                          {satDesk.number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => navigate(`/sat-desk/${satDesk.id}`)}
                          className="text-left hover:underline"
                        >
                          <p className="font-medium">{satDesk.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {satDesk.description}
                          </p>
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-mono">{satDesk.garminAccountId || 'Not set'}</p>
                          {satDesk.garminUsername && (
                            <p className="text-muted-foreground">@{satDesk.garminUsername}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Not checked</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {satDesk.deviceCount} / {satDesk.deviceQuota}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={satDesk.isActive ? 'default' : 'secondary'}>
                          {satDesk.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(satDesk)}
                            title={satDesk.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(satDesk)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(satDesk)}
                            disabled={satDesk.deviceCount > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingSatDesk ? 'Edit SatDesk' : 'Add New SatDesk'}
              </DialogTitle>
              <DialogDescription>
                {editingSatDesk
                  ? 'Update the details of this SatDesk account'
                  : 'Create a new Garmin Professional account for device management'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className="text-right">
                  Number
                </Label>
                <Input
                  id="number"
                  type="number"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: parseInt(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="North Operations"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Primary account for Arctic operations"
                  className="col-span-3"
                />
              </div>

              {/* API Credentials Info */}
              <Alert className="col-span-4 border-blue-200 bg-blue-50">
                <AlertTitle className="text-blue-900">Garmin API Credentials</AlertTitle>
                <AlertDescription className="text-sm text-blue-800">
                  Enter your Garmin Professional account credentials. The API Token/OAuth field
                  will be used once Garmin provides API access. All credentials are encrypted in
                  production.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="garminAccountId" className="text-right">
                  Garmin Account ID
                </Label>
                <Input
                  id="garminAccountId"
                  value={formData.garminAccountId}
                  onChange={(e) =>
                    setFormData({ ...formData, garminAccountId: e.target.value })
                  }
                  placeholder="GM-NORTH-001"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="garminUsername" className="text-right">
                  Garmin Username
                </Label>
                <Input
                  id="garminUsername"
                  value={formData.garminUsername}
                  onChange={(e) =>
                    setFormData({ ...formData, garminUsername: e.target.value })
                  }
                  placeholder="magnus_north"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="garminPassword" className="text-right">
                  Garmin Password
                </Label>
                <Input
                  id="garminPassword"
                  type="password"
                  value={formData.garminPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, garminPassword: e.target.value })
                  }
                  placeholder="Enter account password"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="garminApiToken" className="text-right">
                  API Token/OAuth
                </Label>
                <Input
                  id="garminApiToken"
                  type="password"
                  value={formData.garminApiToken}
                  onChange={(e) =>
                    setFormData({ ...formData, garminApiToken: e.target.value })
                  }
                  placeholder="Token from Garmin API portal"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deviceQuota" className="text-right">
                  Device Quota
                </Label>
                <Input
                  id="deviceQuota"
                  type="number"
                  value={formData.deviceQuota}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceQuota: parseInt(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">
                  Active
                </Label>
                <div className="col-span-3">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingSatDesk ? 'Update' : 'Create'} SatDesk
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}