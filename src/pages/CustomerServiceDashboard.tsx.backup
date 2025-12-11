/**
 * Customer Service Dashboard
 * Streamlined interface for CS reps - guides them through daily tasks
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { WebsiteOrdersAlert } from '@/components/dashboard/WebsiteOrdersAlert';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Phone,
  ShoppingCart,
  Building2,
  Users,
  Calendar,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
  Smartphone,
  RefreshCw,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'urgent' | 'today' | 'upcoming';
  action: string;
  count?: number;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function CustomerServiceDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading tasks
  useEffect(() => {
    // TODO: Replace with real API call
    setTimeout(() => {
      setTasks([
        {
          id: '1',
          title: 'Process Website Orders',
          description: '3 new orders waiting for device assignment',
          type: 'urgent',
          action: '/orders?filter=pending',
          count: 3,
          priority: 'high'
        },
        {
          id: '2',
          title: 'Activations Today',
          description: '5 rentals start today - devices need activation',
          type: 'today',
          action: '/activations/today',
          count: 5,
          dueDate: new Date().toISOString(),
          priority: 'high'
        },
        {
          id: '3',
          title: 'Returns Due Today',
          description: '2 devices scheduled for return',
          type: 'today',
          action: '/returns/today',
          count: 2,
          dueDate: new Date().toISOString(),
          priority: 'medium'
        },
        {
          id: '4',
          title: 'Overdue Rentals',
          description: '1 rental is overdue - contact customer',
          type: 'urgent',
          action: '/rentals?filter=overdue',
          count: 1,
          priority: 'high'
        },
        {
          id: '5',
          title: 'Low Inventory Alert',
          description: 'SatDesk #2 has only 3 available devices',
          type: 'today',
          action: '/inventory',
          count: 3,
          priority: 'medium'
        },
        {
          id: '6',
          title: 'Upcoming Activations',
          description: '8 rentals start tomorrow',
          type: 'upcoming',
          action: '/activations/upcoming',
          count: 8,
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          priority: 'low'
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const urgentTasks = tasks.filter(t => t.type === 'urgent');
  const todayTasks = tasks.filter(t => t.type === 'today');
  const upcomingTasks = tasks.filter(t => t.type === 'upcoming');

  const completionPercentage = 35; // TODO: Calculate based on completed tasks

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Good Morning! 👋</h1>
            <p className="text-muted-foreground mt-1">
              Here's what needs your attention today
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Today's Progress</div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={completionPercentage} className="w-32" />
              <span className="text-sm font-semibold">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Website Orders Alert - NEW! */}
        <WebsiteOrdersAlert maxDisplay={5} showOnlyNew={true} />

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{urgentTasks.length}</div>
              <p className="text-xs text-muted-foreground">Needs immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{todayTasks.length}</div>
              <p className="text-xs text-muted-foreground">Due today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingTasks.length}</div>
              <p className="text-xs text-muted-foreground">Next few days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
              <Smartphone className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">127</div>
              <p className="text-xs text-muted-foreground">Currently rented</p>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Tasks Section */}
        {urgentTasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-bold text-red-600">Urgent - Do These First!</h2>
            </div>
            
            <div className="grid gap-4">
              {urgentTasks.map(task => (
                <Card key={task.id} className="border-2 border-red-200 bg-red-50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <Badge variant="destructive">URGENT</Badge>
                          {task.count && (
                            <Badge variant="outline" className="font-bold">
                              {task.count} items
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{task.description}</CardDescription>
                      </div>
                      <Button 
                        onClick={() => navigate(task.action)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Handle Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Today's Tasks Section */}
        {todayTasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-bold">Today's Schedule</h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {todayTasks.map(task => (
                <Card key={task.id} className="border-orange-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{task.title}</CardTitle>
                          {task.count && (
                            <Badge variant="secondary" className="font-bold">
                              {task.count}
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{task.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate(task.action)}
                      variant="outline"
                      className="w-full"
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary">
              <CardHeader onClick={() => navigate('/rental-intake?source=website')}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Process Website Order</CardTitle>
                    <CardDescription>Quick activation</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary">
              <CardHeader onClick={() => navigate('/rental-intake?source=phone-individual')}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Phone Rental</CardTitle>
                    <CardDescription>Individual customer</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary">
              <CardHeader onClick={() => navigate('/rental-intake?source=phone-b2b')}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">B2B Rental</CardTitle>
                    <CardDescription>Business customer</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary">
              <CardHeader onClick={() => navigate('/rental-intake?source=b2b-bulk')}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">B2B Bulk Order</CardTitle>
                    <CardDescription>Large order</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Upcoming Tasks Preview */}
        {upcomingTasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-bold">Coming Up</h2>
              </div>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-3">
              {upcomingTasks.slice(0, 3).map(task => (
                <Card key={task.id} className="border-blue-100">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-sm">{task.title}</CardTitle>
                          <CardDescription className="text-xs">{task.description}</CardDescription>
                        </div>
                      </div>
                      {task.count && (
                        <Badge variant="outline">{task.count}</Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Help & Tips */}
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertTitle>Tip of the Day</AlertTitle>
          <AlertDescription>
            Use bulk operations when processing multiple website orders at once - it saves time and reduces errors!
          </AlertDescription>
        </Alert>
      </div>
    </AppLayout>
  );
}
