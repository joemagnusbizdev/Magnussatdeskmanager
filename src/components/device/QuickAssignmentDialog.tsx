import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { DeviceCleanupDialog } from '@/components/devices/DeviceCleanupDialog';
import { User, Mail, Phone, AlertCircle } from 'lucide-react';

interface QuickAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceName: string;
  currentUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onAssign: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    emergencyContact: string;
    emergencyPhone: string;
  }) => void;
}

export function QuickAssignmentDialog({
  open,
  onOpenChange,
  deviceName,
  currentUser,
  onAssign,
}: QuickAssignmentDialogProps) {
  const [showCleanup, setShowCleanup] = useState(false);
  const [cleanupCompleted, setCleanupCompleted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
  });

  // Check if device needs cleanup when dialog opens
  const needsCleanup = currentUser && !cleanupCompleted;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset cleanup state when closing
      setCleanupCompleted(false);
      setShowCleanup(false);
    }
    onOpenChange(newOpen);
  };

  const handleAssignClick = () => {
    // If there's a current user and cleanup hasn't been completed, show cleanup dialog
    if (needsCleanup) {
      setShowCleanup(true);
      return;
    }

    // Otherwise, proceed with assignment
    handleSubmit();
  };

  const handleCleanupComplete = () => {
    setCleanupCompleted(true);
    setShowCleanup(false);
    
    toast({
      title: 'Device Cleaned',
      description: 'Device is ready for reassignment. Previous user data has been archived.',
    });
  };

  const handleArchivePreviousUser = () => {
    toast({
      title: 'User Archived',
      description: `${currentUser?.firstName} ${currentUser?.lastName} has been archived.`,
    });
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields (name and email).',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    onAssign(formData);
    
    toast({
      title: 'User Assigned',
      description: `${formData.firstName} ${formData.lastName} has been assigned to ${deviceName}`,
    });

    onOpenChange(false);
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      emergencyContact: '',
      emergencyPhone: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {currentUser ? 'Reassign User' : 'Assign User'}
          </DialogTitle>
          <DialogDescription>
            {currentUser
              ? `Update user assignment for ${deviceName}`
              : `Assign a new user to ${deviceName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {currentUser && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900">Current User</p>
                  <p className="text-orange-700">
                    {currentUser.firstName} {currentUser.lastName} ({currentUser.email})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Information */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john.smith@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-sm font-medium">Emergency Contact</p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Name</Label>
                <Input
                  id="emergencyContact"
                  placeholder="Jane Smith (Spouse)"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContact: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    placeholder="+1 (555) 123-4568"
                    value={formData.emergencyPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, emergencyPhone: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssignClick}>
            {currentUser ? 'Update Assignment' : 'Assign User'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Cleanup Dialog */}
      <DeviceCleanupDialog
        open={showCleanup}
        onOpenChange={setShowCleanup}
        onCleanupComplete={handleCleanupComplete}
        onArchivePreviousUser={handleArchivePreviousUser}
        deviceName={deviceName}
        currentUser={currentUser}
      />
    </Dialog>
  );
}