/**
 * Customer Service Dashboard - LIVE VERSION
 * FIXED: Now fetches real data from backend
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
import { listOrders, getOrderStats, type Order, type OrderStats } from '@/services/api/orders';
import { toast } from 'sonner';
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Fetching dashboard data...');

        // Fetch orders and stats in parallel
        const [ordersData, statsData] = await Promise.all([
          listOrders(),
          getOrderStats(),
        ]);

        console.log('✅ Dashboard data loaded:', {
          orders: ordersData.length,
          stats: statsData,
        });

        setOrders(ordersData);
        setStats(statsData);

        // Generate tasks from real orders
        const generatedTasks = generateTasksFromOrders(ordersData, statsData);
        setTasks(generatedTasks);

        toast.success('Dashboard loaded', {
          description: `${ordersData.length} orders found`,
        });
      } catch (err) {
        console.error('❌ Failed to load dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        toast.error('Failed to load dashboard', {
          description: 'Using offline mode',
        });
        
        // Show empty state instead of mock data
        setTasks([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate tasks from real orders
  const generateTasksFromOrders = (orders: Order[], stats: OrderStats): Task[] => {
    const tasks: Task[] = [];

    // Urgent: New orders waiting for processing
    if (stats.new > 0) {
      tasks.push({
        id: 'urgent-new-orders',
        title: 'Process New Orders',
        description: `${stats.new} new orders waiting for device assignment`,
        type: 'urgent',
        action: '/orders?filter=new',
        count: stats.new,
        priority: 'high',
      });
    }

    // Today: Recent orders (last 24 hours)
    if (stats.last24Hours > 0) {
      tasks.push({
        id: 'today-recent',
        title: 'Recent Orders',
        description: `${stats.last24Hours} orders received in the last 24 hours`,
        type: 'today',
        action: '/orders?filter=recent',
        count: stats.last24Hours,
        dueDate: new Date().toISOString(),
        priority: 'high',
      });
    }

    // Processing orders
    if (stats.processing > 0) {
      tasks.push({
        id: 'today-processing',
        title: 'Orders in Progress',
        description: `${stats.processing} orders currently being processed`,
        type: 'today',
        action: '/orders?filter=processing',
        count: stats.processing,
        priority: 'medium',
      });
    }

    // Upcoming: This week's orders
    if (stats.last7Days > 0) {
      tasks.push({
        id: 'upcoming-week',
        title: 'This Week\'s Orders',
        description: `${stats.last7Days} orders this week`,
        type: 'upcoming',
        action: '/orders?filter=week',
        count: stats.last7Days,
        priority: 'low',
      });
    }

    return tasks;
  };

  const urgentTasks = tasks.filter(t => t.type === 'urgent');
  const todayTasks = tasks.filter(t => t.type === 'today');
  const upcomingTasks = tasks.filter(t => t.type === 'upcoming');

  // Calculate completion percentage
  const completionPercentage = stats
    ? Math.round(((stats.completed + stats.cancelled) / Math.max(stats.total, 1)) * 100)
    : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
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
              {orders.length > 0 
                ? `You have ${orders.length} orders to manage`
                : "No orders yet - everything's quiet!"
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Processing Rate</div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={completionPercentage} className="w-32" />
              <span className="text-sm font-semibold">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-900">Backend Connected</AlertTitle>
          <AlertDescription className="text-green-700">
            Showing live data from magnussatdeskmanager.onrender.com
          </AlertDescription>
        </Alert>

        {/* Website Orders Alert */}
        <WebsiteOrdersAlert maxDisplay={5} showOnlyNew={true} />

        {/* Quick Stats - LIVE DATA */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Orders</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.new || 0}</div>
              <p className="text-xs text-muted-foreground">Needs processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.processing || 0}</div>
              <p className="text-xs text-muted-foreground">Being processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Smartphone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
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
              <h2 className="text-xl font-bold">Today's Activity</h2>
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
                    <CardTitle className="text-base">Process Order</CardTitle>
                    <CardDescription>Website order</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-2 hover:border-primary">
              <CardHeader onClick={() => navigate('/orders')}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">View All Orders</CardTitle>
                    <CardDescription>Order management</CardDescription>
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
                    <CardTitle className="text-base">Bulk Order</CardTitle>
                    <CardDescription>Large order</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertTitle>No Orders Yet</AlertTitle>
            <AlertDescription>
              Your dashboard will show real orders once they start coming in from magnus.co.il
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AppLayout>
  );
}
