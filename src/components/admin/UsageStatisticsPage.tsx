import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUsageStatistics, UsageStat, TimeRange } from '@/hooks/use-usage-statistics';
import { Calendar as CalendarIcon, Loader2, Search, Tag, User, Clock, BarChart3, AtSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const timeRangeLabels: Record<TimeRange, string> = {
  day: 'Nap',
  week: 'Hét',
  month: 'Hónap',
  year: 'Év',
};

const UsageStatisticsPage: React.FC = () => {
  const { stats, detailedUsages, isLoading, fetchStatistics } = useUsageStatistics();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [emailFilter, setEmailFilter] = useState('');

  // Fetch data whenever date, timeRange, or filter changes
  useEffect(() => {
    fetchStatistics(selectedDate, timeRange, emailFilter);
  }, [selectedDate, timeRange, emailFilter, fetchStatistics]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 border border-pink-500/30 p-3 rounded-lg shadow-lg text-white text-sm backdrop-blur-sm">
          <p className="font-bold text-pink-300">{label}</p>
          <p className="text-gray-300">Beváltások: <span className="font-semibold">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };
  
  const getDisplayDate = () => {
    switch (timeRange) {
      case 'day':
        return format(selectedDate, "yyyy. MM. dd.");
      case 'week':
        return `${format(selectedDate, "yyyy. MM. dd.")} (Hét)`;
      case 'month':
        return format(selectedDate, "yyyy. MMMM");
      case 'year':
        return format(selectedDate, "yyyy");
      default:
        return format(selectedDate, "yyyy. MM. dd.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-pink-300 flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Beváltási Statisztikák
        </h2>
      </div>

      {/* Filters */}
      <Card className="bg-black/50 border-pink-500/30 backdrop-blur-sm p-4 mb-8">
        <CardContent className="p-0 space-y-4">
          {/* Time Range Selector */}
          <ToggleGroup 
            type="single" 
            value={timeRange} 
            onValueChange={(value: TimeRange) => {
              if (value) setTimeRange(value);
            }}
            className="w-full justify-center bg-gray-800/50 rounded-lg p-1"
          >
            {(Object.keys(timeRangeLabels) as TimeRange[]).map(range => (
              <ToggleGroupItem 
                key={range} 
                value={range} 
                aria-label={`Válassz ${timeRangeLabels[range]}`}
                className="flex-grow data-[state=on]:bg-pink-600/70 data-[state=on]:text-white hover:bg-pink-600/50 text-gray-300"
              >
                {timeRangeLabels[range]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50",
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {getDisplayDate()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border-pink-500/30 backdrop-blur-sm text-black">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {/* Email/Username Filter (Only visible for 'day' range) */}
            {timeRange === 'day' && (
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  type="text"
                  placeholder="Szűrés felhasználónévre vagy email címre..."
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
          <p className="ml-3 text-gray-300">Statisztikák betöltése...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Chart */}
          <Card className="bg-black/50 border-pink-500/30 backdrop-blur-sm text-white p-4">
            <CardHeader>
              <CardTitle className="text-xl text-pink-300">Beváltások {timeRangeLabels[timeRange]} bontásban</CardTitle>
            </CardHeader>
            <CardContent className="h-80 p-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="label" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed List (Only visible for 'day' range) */}
          {timeRange === 'day' && (
            <>
              <h3 className="text-2xl font-bold text-pink-300 mt-8">Részletes Beváltások ({detailedUsages.length})</h3>
              
              {detailedUsages.length === 0 ? (
                <p className="text-gray-400">Nincs találat a kiválasztott napra és szűrőre.</p>
              ) : (
                <div className="space-y-4">
                  {detailedUsages.map((usage) => (
                    <Card key={usage.id} className="bg-black/50 border-gray-700/50 backdrop-blur-sm text-white">
                      <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="space-y-1 mb-2 sm:mb-0">
                          <p className="text-lg font-semibold text-cyan-300 flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-purple-400" />
                            {usage.coupon_title}
                          </p>
                          <p className="text-sm text-gray-400 flex items-center">
                            <AtSign className="h-4 w-4 mr-2 text-purple-400" />
                            {usage.username}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-400 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-purple-400" />
                          {format(new Date(usage.redeemed_at), 'yyyy. MM. dd. HH:mm:ss')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UsageStatisticsPage;