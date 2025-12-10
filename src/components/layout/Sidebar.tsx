import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Smartphone,
  UserPlus,
  Archive,
  Settings,
  Radio,
  Menu,
  X,
  Building2,
  ShoppingCart,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Calendar,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SatDeskSelector } from '@/components/satdesk/SatDeskSelector';
import { IMEILookup } from '@/components/device/IMEILookup';
import { useSystemStatusStore } from '@/stores/systemStatusStore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Sales',
    href: '/sales',
    icon: ShoppingBag,
  },
  {
    name: 'Devices',
    href: '/devices',
    icon: Smartphone,
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    name: 'New Rental',
    href: '/new-rental',
    icon: UserPlus,
  },
  {
    name: 'Archive',
    href: '/archive',
    icon: Archive,
  },
  {
    name: 'SatDesks',
    href: '/sat-desks',
    icon: Building2,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { status, isChecking, runHealthCheck, startAutoCheck, stopAutoCheck } = useSystemStatusStore();

  // Start auto-check on mount
  useEffect(() => {
    startAutoCheck();
    return () => stopAutoCheck();
  }, [startAutoCheck, stopAutoCheck]);

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-3 w-3 animate-spin" />;
    }
    switch (status.overall) {
      case 'operational':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'degraded':
        return <AlertTriangle className="h-3 w-3" />;
      case 'critical':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Loader2 className="h-3 w-3 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status.overall) {
      case 'operational':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking Systems...';
    switch (status.overall) {
      case 'operational':
        return 'All Systems Operational';
      case 'degraded':
        return 'System Degraded';
      case 'critical':
        return 'System Critical';
      default:
        return 'Checking...';
    }
  };

  const getStatusBackground = () => {
    switch (status.overall) {
      case 'operational':
        return 'bg-green-500/10 border-green-500/20';
      case 'degraded':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'critical':
        return 'bg-red-500/10 border-red-500/20';
      default:
        return 'bg-sidebar-accent/30';
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 transform bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 px-6 border-b border-sidebar-border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent">
              <Radio className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Magnus</h1>
              <p className="text-xs text-sidebar-foreground/60">inReach Manager</p>
            </div>
          </div>

          {/* SatDesk Selector */}
          <div className="px-3 py-4 border-b border-sidebar-border">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Account
            </p>
            <SatDeskSelector />
          </div>

          {/* Quick Actions */}
          <div className="px-3 py-4 border-b border-sidebar-border">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
              Quick Actions
            </p>
            <IMEILookup />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* System Status Footer */}
          <div className="border-t border-sidebar-border p-4">
            <TooltipProvider>
              <Tooltip open={showDetails} onOpenChange={setShowDetails}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'w-full rounded-lg border p-3 transition-all hover:border-sidebar-border cursor-pointer',
                      getStatusBackground()
                    )}
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-sidebar-foreground/80">
                        System Status
                      </p>
                      <button
                        className="text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          runHealthCheck();
                        }}
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={getStatusColor()}>{getStatusIcon()}</span>
                      <span className={cn('text-xs', getStatusColor())}>
                        {getStatusText()}
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="w-80 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">System Health Checks</h4>
                      <span className="text-xs text-muted-foreground">
                        {new Date(status.lastUpdate).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {Object.values(status.checks).map((check) => (
                        <div
                          key={check.name}
                          className="flex items-start justify-between gap-2 rounded-md border border-border/50 bg-background/50 p-2"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{check.name}</p>
                            <p className="text-xs text-muted-foreground">{check.message}</p>
                          </div>
                          <div
                            className={cn(
                              'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full',
                              check.status === 'ok' && 'bg-green-500/20 text-green-500',
                              check.status === 'warning' && 'bg-yellow-500/20 text-yellow-500',
                              check.status === 'error' && 'bg-red-500/20 text-red-500',
                              check.status === 'checking' && 'bg-gray-500/20 text-gray-500'
                            )}
                          >
                            {check.status === 'ok' && <CheckCircle2 className="h-3 w-3" />}
                            {check.status === 'warning' && <AlertTriangle className="h-3 w-3" />}
                            {check.status === 'error' && <AlertCircle className="h-3 w-3" />}
                            {check.status === 'checking' && <Loader2 className="h-3 w-3 animate-spin" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>
    </>
  );
}