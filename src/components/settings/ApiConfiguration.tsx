/**
 * API Configuration Component
 * Allows users to configure API connection settings
 */

import { useState, useEffect } from 'react';
import { useAppConfigStore } from '@/stores/appConfigStore';
import { getApiStatus, checkFeatureFlag } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner@2.0.3';
import { 
  Server, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Key,
  Database,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

export function ApiConfiguration() {
  const { 
    useMockData, 
    apiConnected, 
    apiUrl, 
    apiKey,
    featureFlags,
    setUseMockData,
    setApiConnected,
    setApiCredentials,
    setFeatureFlags,
  } = useAppConfigStore();

  const [localUrl, setLocalUrl] = useState(apiUrl);
  const [localKey, setLocalKey] = useState(apiKey);
  const [testing, setTesting] = useState(false);
  const [checking, setChecking] = useState(false);

  // Test API connection
  const testConnection = async () => {
    if (!localKey) {
      toast.error('API key required');
      return;
    }

    setTesting(true);
    try {
      // Temporarily set credentials for test
      setApiCredentials(localUrl, localKey);
      
      const status = await getApiStatus();
      
      if (status.status === 'connected') {
        setApiConnected(true);
        toast.success('Connected to backend successfully!', {
          description: `Server: ${status.data?.services?.ecc || 'operational'}`,
        });

        // Check feature flags
        checkFeatures();
      } else {
        setApiConnected(false);
        toast.error('Connection failed', {
          description: status.error || 'Unable to reach backend',
        });
      }
    } catch (error) {
      setApiConnected(false);
      toast.error('Connection failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  // Check feature flags
  const checkFeatures = async () => {
    setChecking(true);
    try {
      const inreachEnabled = await checkFeatureFlag('ENABLE_INREACH');
      const eccSyncEnabled = await checkFeatureFlag('ENABLE_INREACH_ECC_SYNC');
      const garminApiEnabled = await checkFeatureFlag('ENABLE_GARMIN_API');
      
      setFeatureFlags({
        ENABLE_INREACH: inreachEnabled,
        ENABLE_INREACH_ECC_SYNC: eccSyncEnabled,
        ENABLE_GARMIN_API: garminApiEnabled,
      });
    } catch (error) {
      console.error('Failed to check feature flags:', error);
    } finally {
      setChecking(false);
    }
  };

  // Save configuration
  const saveConfiguration = () => {
    setApiCredentials(localUrl, localKey);
    toast.success('Configuration saved');
  };

  // Auto-check connection on mount if API key is set
  useEffect(() => {
    if (apiKey && !apiConnected) {
      testConnection();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-purple-500" />
            <div>
              <h3 className="font-semibold">Backend Connection</h3>
              <p className="text-sm text-muted-foreground">
                Configure connection to Magnus ECC Backend
              </p>
            </div>
          </div>
          
          <Badge 
            variant={apiConnected ? 'default' : 'secondary'}
            className={apiConnected ? 'bg-green-500' : ''}
          >
            {apiConnected ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </div>

        {/* API URL */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="api-url">API URL</Label>
            <Input
              id="api-url"
              type="url"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              placeholder="https://magnus-garmin-ecc.onrender.com"
              className="mt-1"
            />
          </div>

          {/* API Key */}
          <div>
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              placeholder="Enter your API key"
              className="mt-1 font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get your API key from your backend administrator
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={testConnection}
              disabled={testing || !localKey}
              variant="outline"
              size="sm"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>

            <Button
              onClick={saveConfiguration}
              disabled={!localKey}
              size="sm"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </Card>

      {/* Mock Data Toggle */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-purple-500" />
            <div>
              <h3 className="font-semibold">Mock Data Mode</h3>
              <p className="text-sm text-muted-foreground">
                Use sample data for testing without backend connection
              </p>
            </div>
          </div>
          
          <Switch
            checked={useMockData}
            onCheckedChange={setUseMockData}
          />
        </div>

        {useMockData && (
          <Alert className="mt-4 border-amber-500/50 bg-amber-500/10">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-600">
              You are currently using mock data. All changes are temporary and won't be saved.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Feature Flags */}
      {apiConnected && !useMockData && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Backend Feature Flags</h3>
              <p className="text-sm text-muted-foreground">
                Features currently enabled on the backend
              </p>
            </div>
            
            <Button
              onClick={checkFeatures}
              disabled={checking}
              variant="outline"
              size="sm"
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <FeatureFlagItem 
              name="inReach Manager"
              enabled={featureFlags.ENABLE_INREACH}
            />
            <FeatureFlagItem 
              name="ECC Integration"
              enabled={featureFlags.ENABLE_INREACH_ECC_SYNC}
            />
            <FeatureFlagItem 
              name="Garmin API"
              enabled={featureFlags.ENABLE_GARMIN_API}
            />
          </div>

          {!featureFlags.ENABLE_INREACH && (
            <Alert className="mt-4 border-red-500/50 bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                The inReach Manager module is currently disabled on the backend.
                Contact your administrator to enable it.
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}
    </div>
  );
}

function FeatureFlagItem({ name, enabled }: { name: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <span className="text-sm">{name}</span>
      <Badge 
        variant={enabled ? 'default' : 'secondary'}
        className={enabled ? 'bg-green-500' : ''}
      >
        {enabled ? 'Enabled' : 'Disabled'}
      </Badge>
    </div>
  );
}
