import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockDevices } from '@/data/mockDevices';
import { DeviceUser } from '@/types/device';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Search, Eye, Mail, Phone, FileText } from 'lucide-react';

interface UserWithDevice extends DeviceUser {
  deviceId: string;
  deviceNumber: number;
  status: string;
}

export function Users() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all users from devices
  const allUsers: UserWithDevice[] = mockDevices
    .filter((device) => device.user)
    .map((device) => ({
      ...device.user!,
      deviceId: device.id,
      deviceNumber: device.deviceNumber,
      status: device.status,
    }));

  // Filter users based on search
  const filteredUsers = allUsers.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone.toLowerCase().includes(searchLower) ||
      user.idPassport.toLowerCase().includes(searchLower) ||
      user.deviceNumber.toString().includes(searchQuery)
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-purple-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text font-bold text-transparent">
                Users
              </h1>
              <p className="text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {allUsers.length} users
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border-2 border-border/50 bg-white/70 p-4 backdrop-blur-sm">
            <p className="text-sm font-semibold text-muted-foreground">Total Users</p>
            <p className="mt-1 font-bold text-foreground">{allUsers.length}</p>
          </div>
          <div className="rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">Active Rentals</p>
            <p className="mt-1 font-bold text-emerald-900">
              {allUsers.filter((u) => u.status === 'active').length}
            </p>
          </div>
          <div className="rounded-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
            <p className="text-sm font-semibold text-orange-900">Pending Setup</p>
            <p className="mt-1 font-bold text-orange-900">
              {allUsers.filter((u) => u.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, ID/passport, or device #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-2 border-border/50 bg-white/70 pl-10 backdrop-blur-sm focus:border-primary focus:ring-primary"
          />
        </div>

        {/* Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-white/50 py-16 backdrop-blur-sm">
            <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="font-semibold text-foreground">No users found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search query
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border-2 border-border/50 bg-white/70 shadow-lg backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-border/50 bg-gradient-to-r from-purple-50/50 to-background hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-background">
                  <TableHead className="font-bold text-foreground">Name</TableHead>
                  <TableHead className="font-bold text-foreground">Contact</TableHead>
                  <TableHead className="font-bold text-foreground">ID/Passport</TableHead>
                  <TableHead className="font-bold text-foreground">Device</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={`${user.deviceId}-${user.email}`}
                    className="cursor-pointer transition-all hover:bg-purple-50/30"
                    onClick={() => navigate(`/device/${user.deviceId}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-semibold">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          DOB: {new Date(user.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-sm">{user.idPassport}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-900">
                        Device #{user.deviceNumber}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.status === 'active' ? (
                        <Badge className="bg-emerald-500">Active</Badge>
                      ) : user.status === 'pending' ? (
                        <Badge className="bg-orange-500">Pending</Badge>
                      ) : (
                        <Badge variant="secondary">Archived</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/device/${user.deviceId}`);
                        }}
                        className="gap-2 hover:bg-purple-100"
                      >
                        <Eye className="h-4 w-4" />
                        View Device
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Users;
