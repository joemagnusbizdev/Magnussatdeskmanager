import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { mockDevices } from '@/data/mockDevices';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { Device } from '@/types/device';

export function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  // Get the first day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Get active rentals for the current month
  const activeRentals = mockDevices.filter(device => {
    const rentalStart = new Date(device.rentalStart);
    const rentalEnd = new Date(device.rentalEnd);
    return (
      device.status === 'active' &&
      rentalStart <= lastDayOfMonth &&
      rentalEnd >= firstDayOfMonth
    );
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isDeviceActiveOnDate = (device: Device, date: Date) => {
    const rentalStart = new Date(device.rentalStart);
    const rentalEnd = new Date(device.rentalEnd);
    rentalStart.setHours(0, 0, 0, 0);
    rentalEnd.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate >= rentalStart && checkDate <= rentalEnd;
  };

  const getDevicesForDate = (date: Date) => {
    return activeRentals.filter(device => isDeviceActiveOnDate(device, date));
  };

  const getAvailableDevicesForDate = (date: Date) => {
    const activeCount = getDevicesForDate(date).length;
    return mockDevices.length - activeCount;
  };

  // Generate calendar days
  const calendarDays = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
                Calendar & Timeline
              </h1>
              <p className="text-sm text-muted-foreground">
                View rental schedule and device availability
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Rental Calendar
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Device Timeline
            </TabsTrigger>
          </TabsList>

          {/* Rental Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between rounded-lg border-2 border-border/50 bg-white/70 p-4 backdrop-blur-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="text-center">
                <h2 className="font-bold text-foreground">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {activeRentals.length} active rentals
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="rounded-xl border-2 border-border/50 bg-white/70 p-4 backdrop-blur-sm">
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="p-2" />;
                  }

                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const devices = getDevicesForDate(date);
                  const available = getAvailableDevicesForDate(date);
                  const isToday = 
                    date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={day}
                      className={`min-h-[100px] rounded-lg border-2 p-2 transition-all hover:border-purple-300 hover:bg-purple-50/50 ${
                        isToday ? 'border-purple-500 bg-purple-50' : 'border-border/30'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className={`text-sm font-semibold ${
                          isToday ? 'text-purple-700' : 'text-foreground'
                        }`}>
                          {day}
                        </span>
                        {devices.length > 0 && (
                          <Badge variant="secondary" className="h-5 text-xs">
                            {devices.length}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        {devices.slice(0, 2).map(device => (
                          <div
                            key={device.id}
                            onClick={() => navigate(`/device/${device.id}`)}
                            className="cursor-pointer rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-900 hover:bg-purple-200"
                          >
                            Device #{device.deviceNumber}
                          </div>
                        ))}
                        {devices.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{devices.length - 2} more
                          </div>
                        )}
                        {devices.length === 0 && (
                          <div className="text-xs text-green-600">
                            {available} available
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 rounded-lg border-2 border-border/50 bg-white/70 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border-2 border-purple-500 bg-purple-50" />
                <span className="text-sm">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-purple-100" />
                <span className="text-sm">Active Rental</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="h-5">3</Badge>
                <span className="text-sm">Number of active devices</span>
              </div>
            </div>
          </TabsContent>

          {/* Device Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <div className="rounded-xl border-2 border-border/50 bg-white/70 p-6 backdrop-blur-sm">
              <h3 className="mb-4 font-bold text-foreground">Device Usage Timeline</h3>
              <div className="space-y-3">
                {mockDevices.map(device => {
                  const startDate = new Date(device.rentalStart);
                  const endDate = new Date(device.rentalEnd);
                  const today = new Date();
                  
                  // Calculate position and width percentages for the year
                  const yearStart = new Date(today.getFullYear(), 0, 1);
                  const yearEnd = new Date(today.getFullYear(), 11, 31);
                  const yearDays = (yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24);
                  
                  const startOffset = Math.max(0, (startDate.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
                  const duration = (endDate.getTime() - Math.max(startDate.getTime(), yearStart.getTime())) / (1000 * 60 * 60 * 24);
                  
                  const leftPercent = (startOffset / yearDays) * 100;
                  const widthPercent = Math.min((duration / yearDays) * 100, 100 - leftPercent);

                  return (
                    <div key={device.id} className="group relative">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-semibold">Device #{device.deviceNumber}</span>
                        <span className="text-xs text-muted-foreground">
                          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="relative h-8 rounded-lg bg-gray-100">
                        {device.status === 'active' && (
                          <div
                            className="absolute h-full rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 transition-all group-hover:from-purple-600 group-hover:to-purple-700"
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          >
                            <div className="flex h-full items-center justify-center text-xs text-white">
                              {device.user && `${device.user.firstName} ${device.user.lastName}`}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Legend */}
            <div className="flex items-center gap-4 rounded-lg border-2 border-border/50 bg-white/70 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 rounded bg-gradient-to-r from-purple-500 to-purple-600" />
                <span className="text-sm">Active Rental Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-8 rounded bg-gray-100" />
                <span className="text-sm">Available</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default Calendar;
