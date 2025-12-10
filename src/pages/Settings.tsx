import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSystemStatusStore } from '@/stores/systemStatusStore';
import { toast } from '@/hooks/use-toast';
import { ApiConfiguration } from '@/components/settings/ApiConfiguration';
import {
  Settings as SettingsIcon,
  Plug,
  Bell,
  Database,
  Loader2,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Activity,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Shield,
  Lock,
  ShieldAlert,
  Server,
} from 'lucide-react';

export default function Settings() {
  const {
    garminAPI,
    eccAPI,
    ecommerceAPI,
    notifications,
    dataRetention,
    updateGarminAPI,
    updateECCAPI,
    updateEcommerceAPI,
    updateNotifications,
    updateDataRetention,
    testGarminConnection,
    testECCConnection,
    testEcommerceConnection,
  } = useSettingsStore();

  const { status, isChecking, runHealthCheck } = useSystemStatusStore();

  const [testing, setTesting] = useState({ garmin: false, ecc: false, ecommerce: false });

  const handleTestGarmin = async () => {
    setTesting({ ...testing, garmin: true });
    const success = await testGarminConnection();
    setTesting({ ...testing, garmin: false });
    
    toast({
      title: success ? 'Connection Successful' : 'Connection Failed',
      description: success
        ? 'Successfully connected to Garmin API'
        : 'Failed to connect. Please check your credentials.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleTestECC = async () => {
    setTesting({ ...testing, ecc: true });
    const success = await testECCConnection();
    setTesting({ ...testing, ecc: false });
    
    toast({
      title: success ? 'Connection Successful' : 'Connection Failed',
      description: success
        ? 'Successfully connected to ECC API'
        : 'Failed to connect. Please check your credentials.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleTestEcommerce = async () => {
    setTesting({ ...testing, ecommerce: true });
    const success = await testEcommerceConnection();
    setTesting({ ...testing, ecommerce: false });
    
    toast({
      title: success ? 'Connection Successful' : 'Connection Failed',
      description: success
        ? 'Successfully connected to Ecommerce API'
        : 'Failed to connect. Please check your credentials.',
      variant: success ? 'default' : 'destructive',
    });
  };

  const handleSaveGarmin = () => {
    toast({
      title: 'Settings Saved',
      description: 'Garmin API configuration has been updated.',
    });
  };

  const handleSaveECC = () => {
    toast({
      title: 'Settings Saved',
      description: 'ECC API configuration has been updated.',
    });
  };

  const handleSaveEcommerce = () => {
    toast({
      title: 'Settings Saved',
      description: 'Ecommerce API configuration has been updated.',
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Settings Saved',
      description: 'Notification preferences have been updated.',
    });
  };

  const handleSaveDataRetention = () => {
    toast({
      title: 'Settings Saved',
      description: 'Data retention policies have been updated.',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
            <SettingsIcon className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl">Settings</h1>
              <Badge variant="secondary" className="gap-1 border-2 border-purple-300 bg-purple-50">
                <Shield className="h-3 w-3 text-purple-700" />
                <span className="font-semibold text-purple-700">Admin Only</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage API connections, notifications, and system preferences
            </p>
          </div>
        </div>

        {/* Admin Access Notice */}
        <Alert className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
          <ShieldAlert className="h-5 w-5 text-purple-700" />
          <AlertTitle className="text-purple-900">Administrator Access Required</AlertTitle>
          <AlertDescription className="text-purple-800">
            <p className="mb-2">
              This section contains sensitive system configuration and requires <strong>admin-level authentication</strong>.
            </p>
            <div className="flex items-start gap-2 rounded-lg bg-white/60 p-3 text-sm">
              <Lock className="h-4 w-4 mt-0.5 text-purple-700 shrink-0" />
              <div>
                <p className="font-medium text-purple-900">Authentication System Status</p>
                <p className="text-purple-700">
                  Login protocols will be implemented in future releases. Current access is unrestricted for development purposes.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Settings Tabs */}
        <Tabs defaultValue="backend" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="backend" className="gap-2">
              <Server className="h-4 w-4" />
              Backend API
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Plug className="h-4 w-4" />
              API Connections
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              Data Retention
            </TabsTrigger>
          </TabsList>

          {/* Backend API Tab */}
          <TabsContent value="backend">
            <ApiConfiguration />
          </TabsContent>

          {/* API Connections Tab */}
          <TabsContent value="api" className="space-y-6">
            {/* Garmin API */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Garmin API Configuration</CardTitle>
                    <CardDescription>
                      Configure your Garmin Professional account API credentials
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {garminAPI.isConnected ? (
                      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Not Connected</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="garmin-api-key">API Key</Label>
                  <Input
                    id="garmin-api-key"
                    type="password"
                    placeholder="Enter your Garmin API key"
                    value={garminAPI.apiKey}
                    onChange={(e) => updateGarminAPI({ apiKey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="garmin-api-secret">API Secret</Label>
                  <Input
                    id="garmin-api-secret"
                    type="password"
                    placeholder="Enter your Garmin API secret"
                    value={garminAPI.apiSecret}
                    onChange={(e) => updateGarminAPI({ apiSecret: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="garmin-webhook">Webhook URL</Label>
                  <Input
                    id="garmin-webhook"
                    type="url"
                    placeholder="https://your-app.com/api/webhooks/garmin"
                    value={garminAPI.webhookUrl}
                    onChange={(e) => updateGarminAPI({ webhookUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    This URL will receive real-time updates from Garmin
                  </p>
                </div>
                {garminAPI.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {new Date(garminAPI.lastSync).toLocaleString()}
                  </p>
                )}
                <div className="flex gap-3">
                  <Button onClick={handleSaveGarmin}>Save Configuration</Button>
                  <Button
                    variant="outline"
                    onClick={handleTestGarmin}
                    disabled={testing.garmin}
                  >
                    {testing.garmin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ECC API */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Emergency Command Center (ECC) API</CardTitle>
                    <CardDescription>
                      Configure connection to your in-house emergency command center
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {eccAPI.isConnected ? (
                      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Not Connected</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ecc-api-url">ECC API URL</Label>
                  <Input
                    id="ecc-api-url"
                    type="url"
                    placeholder="https://ecc.magnus.com/api"
                    value={eccAPI.apiUrl}
                    onChange={(e) => updateECCAPI({ apiUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ecc-api-key">API Key</Label>
                  <Input
                    id="ecc-api-key"
                    type="password"
                    placeholder="Enter your ECC API key"
                    value={eccAPI.apiKey}
                    onChange={(e) => updateECCAPI({ apiKey: e.target.value })}
                  />
                </div>
                {eccAPI.lastSync && (
                  <p className="text-xs text-muted-foreground">
                    Last sync: {new Date(eccAPI.lastSync).toLocaleString()}
                  </p>
                )}
                <div className="flex gap-3">
                  <Button onClick={handleSaveECC}>Save Configuration</Button>
                  <Button
                    variant="outline"
                    onClick={handleTestECC}
                    disabled={testing.ecc}
                  >
                    {testing.ecc && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ecommerce API */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      E-commerce Integration
                    </CardTitle>
                    <CardDescription>
                      Connect magnus.co.il to automatically create rental requests
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {ecommerceAPI.isConnected ? (
                      <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Not Connected</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ecommerce-website">Website URL</Label>
                  <Input
                    id="ecommerce-website"
                    type="url"
                    placeholder="https://magnus.co.il"
                    value={ecommerceAPI.websiteUrl}
                    onChange={(e) => updateEcommerceAPI({ websiteUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ecommerce-webhook-secret">Webhook Secret</Label>
                  <Input
                    id="ecommerce-webhook-secret"
                    type="password"
                    placeholder="Enter webhook secret key"
                    value={ecommerceAPI.webhookSecret}
                    onChange={(e) => updateEcommerceAPI({ webhookSecret: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to verify incoming order webhooks from magnus.co.il
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portal-url">Customer Portal URL</Label>
                  <Input
                    id="portal-url"
                    type="url"
                    placeholder="https://portal.magnus.com/rental"
                    value={ecommerceAPI.portalUrl}
                    onChange={(e) => updateEcommerceAPI({ portalUrl: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL to send customers for completing rental preferences
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Auto-create Rentals</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create rental requests from e-commerce orders
                    </p>
                  </div>
                  <Switch
                    checked={ecommerceAPI.autoCreateRentals}
                    onCheckedChange={(checked) =>
                      updateEcommerceAPI({ autoCreateRentals: checked })
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveEcommerce}>Save Configuration</Button>
                  <Button
                    variant="outline"
                    onClick={handleTestEcommerce}
                    disabled={testing.ecommerce}
                  >
                    {testing.ecommerce && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure alerts and notifications for rental management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="expiration-days">Rental Expiration Alert (days before)</Label>
                  <Input
                    id="expiration-days"
                    type="number"
                    min="1"
                    max="30"
                    value={notifications.rentalExpirationDays}
                    onChange={(e) =>
                      updateNotifications({ rentalExpirationDays: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Get notified when rentals are approaching their end date
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@magnus.com"
                    value={notifications.adminEmail}
                    onChange={(e) => updateNotifications({ adminEmail: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email alerts for important events
                    </p>
                  </div>
                  <Switch
                    checked={notifications.enableEmailNotifications}
                    onCheckedChange={(checked) =>
                      updateNotifications({ enableEmailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive SMS alerts for critical events
                    </p>
                  </div>
                  <Switch
                    checked={notifications.enableSMSNotifications}
                    onCheckedChange={(checked) =>
                      updateNotifications({ enableSMSNotifications: checked })
                    }
                  />
                </div>

                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Retention Tab */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Retention Policies</CardTitle>
                <CardDescription>
                  Manage how long rental and user data is stored in the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="archive-days">Auto-Archive After (days)</Label>
                  <Input
                    id="archive-days"
                    type="number"
                    min="1"
                    max="365"
                    value={dataRetention.archiveAfterDays}
                    onChange={(e) =>
                      updateDataRetention({ archiveAfterDays: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Completed rentals will be automatically moved to archive
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purge-days">Auto-Purge After (days)</Label>
                  <Input
                    id="purge-days"
                    type="number"
                    min="30"
                    max="3650"
                    value={dataRetention.purgeAfterDays}
                    onChange={(e) =>
                      updateDataRetention({ purgeAfterDays: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Archived rentals will be permanently deleted (GDPR compliance)
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Enable Auto-Archive</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically archive completed rentals
                    </p>
                  </div>
                  <Switch
                    checked={dataRetention.enableAutoArchive}
                    onCheckedChange={(checked) =>
                      updateDataRetention({ enableAutoArchive: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-destructive">Enable Auto-Purge</Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete old archived data (cannot be undone)
                    </p>
                  </div>
                  <Switch
                    checked={dataRetention.enableAutoPurge}
                    onCheckedChange={(checked) =>
                      updateDataRetention({ enableAutoPurge: checked })
                    }
                  />
                </div>

                <Button onClick={handleSaveDataRetention}>Save Policies</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}