import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAccountVaultStore } from '@/stores/accountVaultStore';
import { toast } from '@/hooks/use-toast';
import {
  KeyRound,
  Search,
  Plus,
  Eye,
  EyeOff,
  Shield,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AccountVault() {
  const { accounts, addAccount, updateAccount, deleteAccount, searchAccounts } = useAccountVaultStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  // New account form state
  const [newAccount, setNewAccount] = useState({
    email: '',
    password: '',
    accountType: 'shared' as 'customer' | 'shared' | 'test',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    notes: '',
    twoFactorEnabled: false,
  });

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch = searchQuery === '' || 
      account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || account.accountType === typeFilter;
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedAccountData = selectedAccount ? accounts.find(a => a.id === selectedAccount) : null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      customer: 'bg-purple-100 text-purple-700 border-purple-300',
      shared: 'bg-blue-100 text-blue-700 border-blue-300',
      test: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const handleAddAccount = () => {
    if (!newAccount.email || !newAccount.password) {
      toast({
        title: 'Validation Error',
        description: 'Email and password are required',
        variant: 'destructive',
      });
      return;
    }

    addAccount({
      ...newAccount,
      associatedDevices: [],
      associatedCustomers: [],
      lastUsed: undefined,
      lastLoginSuccess: undefined,
    });

    toast({
      title: 'Account Created',
      description: 'Garmin account has been added to the vault',
    });

    setIsAddDialogOpen(false);
    setNewAccount({
      email: '',
      password: '',
      accountType: 'shared',
      status: 'active',
      notes: '',
      twoFactorEnabled: false,
    });
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      deleteAccount(id);
      toast({
        title: 'Account Deleted',
        description: 'Account has been removed from the vault',
      });
      setSelectedAccount(null);
    }
  };

  const togglePasswordVisibility = (accountId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
              <KeyRound className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl">Garmin Account Vault</h1>
                <Badge variant="secondary" className="gap-1 border-2 border-purple-300 bg-purple-50">
                  <Shield className="h-3 w-3 text-purple-700" />
                  <span className="font-semibold text-purple-700">Encrypted</span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure credential management for Garmin Explore accounts
              </p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Garmin Account</DialogTitle>
                <DialogDescription>
                  Create a new Garmin Explore account entry in the vault
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Alert className="border-amber-300 bg-amber-50">
                  <Lock className="h-4 w-4 text-amber-700" />
                  <AlertTitle className="text-amber-900">Security Notice</AlertTitle>
                  <AlertDescription className="text-amber-800">
                    Credentials are encrypted at rest. In production, use hardware security modules (HSM) for key storage.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Garmin Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="account@magnus.com"
                      value={newAccount.email}
                      onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={newAccount.password}
                      onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select
                      value={newAccount.accountType}
                      onValueChange={(value) => setNewAccount({ ...newAccount, accountType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shared">Shared Account</SelectItem>
                        <SelectItem value="customer">Customer Account</SelectItem>
                        <SelectItem value="test">Test Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newAccount.status}
                      onValueChange={(value) => setNewAccount({ ...newAccount, status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Account usage notes..."
                    value={newAccount.notes}
                    onChange={(e) => setNewAccount({ ...newAccount, notes: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAccount}>Create Account</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Security Warning */}
        <Alert className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
          <ShieldAlert className="h-5 w-5 text-purple-700" />
          <AlertTitle className="text-purple-900">Secure Credential Storage</AlertTitle>
          <AlertDescription className="text-purple-800">
            All passwords are encrypted using AES-256 encryption. Access to this vault requires admin-level authentication. 
            Never share credentials outside of this secure system.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search email, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="shared">Shared</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Accounts</p>
                  <p className="text-2xl font-semibold">{filteredAccounts.length}</p>
                </div>
                <KeyRound className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-semibold text-success">
                    {filteredAccounts.filter(a => a.status === 'active').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Shared</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {filteredAccounts.filter(a => a.accountType === 'shared').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="text-2xl font-semibold text-purple-600">
                    {filteredAccounts.filter(a => a.accountType === 'customer').length}
                  </p>
                </div>
                <KeyRound className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account List & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account List */}
          <Card>
            <CardHeader>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>Garmin Explore account credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredAccounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setSelectedAccount(account.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAccount === account.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-border hover:border-purple-300 hover:bg-accent/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(account.status)}
                          <p className="font-medium truncate">{account.email}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Badge variant="outline" className={getTypeColor(account.accountType)}>
                            {account.accountType}
                          </Badge>
                          <span>•</span>
                          <span>{account.associatedDevices.length} devices</span>
                          {account.twoFactorEnabled && (
                            <>
                              <span>•</span>
                              <Shield className="h-3 w-3" />
                            </>
                          )}
                        </div>
                        {account.lastUsed && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Last used {format(account.lastUsed, 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredAccounts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <KeyRound className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No accounts found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Detailed credential information</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAccountData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedAccountData.status)}
                      <p className="font-medium">{selectedAccountData.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAccount(selectedAccountData.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Account Type</Label>
                      <Badge variant="outline" className={`${getTypeColor(selectedAccountData.accountType)} mt-1`}>
                        {selectedAccountData.accountType}
                      </Badge>
                    </div>

                    <div>
                      <Label>Password</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type={showPassword[selectedAccountData.id] ? 'text' : 'password'}
                          value={selectedAccountData.password}
                          readOnly
                          className="font-mono"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePasswordVisibility(selectedAccountData.id)}
                        >
                          {showPassword[selectedAccountData.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Created</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(selectedAccountData.createdDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {selectedAccountData.lastUsed && (
                        <div>
                          <Label>Last Used</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(selectedAccountData.lastUsed, 'MMM dd, yyyy')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>Associated Devices ({selectedAccountData.associatedDevices.length})</Label>
                      <div className="mt-2 space-y-1">
                        {selectedAccountData.associatedDevices.length > 0 ? (
                          selectedAccountData.associatedDevices.map((imei) => (
                            <div key={imei} className="text-sm p-2 rounded bg-muted font-mono">
                              {imei}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No devices associated</p>
                        )}
                      </div>
                    </div>

                    {selectedAccountData.notes && (
                      <div>
                        <Label>Notes</Label>
                        <p className="text-sm text-muted-foreground mt-1 p-3 rounded bg-muted">
                          {selectedAccountData.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 rounded bg-muted">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-xs text-muted-foreground">Enhanced security</p>
                      </div>
                      <Badge variant={selectedAccountData.twoFactorEnabled ? 'default' : 'secondary'}>
                        {selectedAccountData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <KeyRound className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Select an account to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
