import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, BookOpen, Clock } from 'lucide-react';
import { useStudySessions, useSubjects } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function Analytics() {
  const { data: sessions = [], isLoading: sessionsLoading } = useStudySessions();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();

  const dailyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    return last7Days.map((date) => {
      const dayStart = BigInt(date.getTime() * 1000000);
      const dayEnd = BigInt((date.getTime() + 86400000) * 1000000);

      const daySessions = sessions.filter(
        (s) => s.date >= dayStart && s.date < dayEnd
      );

      const totalMinutes = daySessions.reduce((sum, s) => sum + Number(s.duration), 0);

      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Number((totalMinutes / 60).toFixed(1)),
        sessions: daySessions.length,
      };
    });
  }, [sessions]);

  const subjectData = useMemo(() => {
    const subjectStats = subjects.map((subject) => {
      const subjectSessions = sessions.filter((s) => s.subjectId === subject.id);
      const totalMinutes = subjectSessions.reduce((sum, s) => sum + Number(s.duration), 0);

      return {
        name: subject.name,
        hours: Number((totalMinutes / 60).toFixed(1)),
        color: subject.color,
        sessions: subjectSessions.length,
      };
    });

    return subjectStats.filter((s) => s.hours > 0).sort((a, b) => b.hours - a.hours);
  }, [sessions, subjects]);

  const weeklyStats = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekStartTimestamp = BigInt(weekStart.getTime() * 1000000);

    const weeklySessions = sessions.filter((s) => s.date >= weekStartTimestamp);
    const totalMinutes = weeklySessions.reduce((sum, s) => sum + Number(s.duration), 0);
    const totalHours = totalMinutes / 60;
    const avgHoursPerDay = totalHours / 7;

    return {
      totalHours: totalHours.toFixed(1),
      totalSessions: weeklySessions.length,
      avgHoursPerDay: avgHoursPerDay.toFixed(1),
    };
  }, [sessions]);

  if (sessionsLoading || subjectsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Analytics</h2>
        <p className="text-muted-foreground mt-1">Analyze your study performance</p>
      </div>

      {/* Weekly Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Total</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.totalHours} hours</div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.avgHoursPerDay} hours</div>
            <p className="text-xs text-muted-foreground mt-1">Per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyData.every((d) => d.hours === 0) ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mb-4 opacity-50" />
                  <p>No data available yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    />
                    <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribution by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              {subjectData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <BookOpen className="h-16 w-16 mb-4 opacity-50" />
                  <p>No data available yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subjectData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.hours}h`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="hours"
                      >
                        {subjectData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-3">
                    {subjectData.map((subject) => (
                      <div
                        key={subject.name}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="font-medium">{subject.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{subject.hours} hours</p>
                          <p className="text-xs text-muted-foreground">
                            {subject.sessions} sessions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
