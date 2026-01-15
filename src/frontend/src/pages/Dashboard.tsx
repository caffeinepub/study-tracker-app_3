import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, BookOpen, TrendingUp, Play } from 'lucide-react';
import { useStudySessions, useDailyGoal, useSubjects } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardProps {
  onNavigate: (page: 'dashboard' | 'subjects' | 'timer' | 'analytics' | 'goals') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: sessions = [], isLoading: sessionsLoading } = useStudySessions();
  const { data: goal, isLoading: goalLoading } = useDailyGoal();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjects();

  const todayStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = BigInt(today.getTime() * 1000000);

    const todaySessions = sessions.filter((s) => s.date >= todayTimestamp);
    const totalMinutes = todaySessions.reduce((sum, s) => sum + Number(s.duration), 0);
    const totalHours = totalMinutes / 60;
    const sessionCount = todaySessions.length;

    return { totalHours, sessionCount, totalMinutes };
  }, [sessions]);

  const weeklyStats = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekStartTimestamp = BigInt(weekStart.getTime() * 1000000);

    const weeklySessions = sessions.filter((s) => s.date >= weekStartTimestamp);
    const totalMinutes = weeklySessions.reduce((sum, s) => sum + Number(s.duration), 0);
    const totalHours = totalMinutes / 60;

    return { totalHours };
  }, [sessions]);

  const goalProgress = useMemo(() => {
    if (!goal) return 0;

    if (goal.__kind__ === 'timeBased') {
      const targetHours = Number(goal.timeBased);
      return Math.min((todayStats.totalHours / targetHours) * 100, 100);
    } else {
      const targetTasks = Number(goal.taskBased);
      return Math.min((todayStats.sessionCount / targetTasks) * 100, 100);
    }
  }, [goal, todayStats]);

  const recentSessions = useMemo(() => {
    return sessions
      .slice()
      .sort((a, b) => Number(b.startTime - a.startTime))
      .slice(0, 5);
  }, [sessions]);

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.color || '#6366f1';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (sessionsLoading || goalLoading || subjectsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8 md:p-12">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Track your progress today and work towards your goals
          </p>
          <Button size="lg" onClick={() => onNavigate('timer')} className="gap-2">
            <Play className="h-5 w-5" />
            Start Studying
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayStats.totalHours.toFixed(1)} hours
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {todayStats.totalMinutes} minutes
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.sessionCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed sessions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyStats.totalHours.toFixed(1)} hours
            </div>
            <p className="text-xs text-muted-foreground mt-1">This week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active subjects</p>
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress */}
      {goal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Today's Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {goal.__kind__ === 'timeBased'
                    ? `${todayStats.totalHours.toFixed(1)} / ${Number(goal.timeBased)} hours`
                    : `${todayStats.sessionCount} / ${Number(goal.taskBased)} sessions`}
                </span>
                <span className="font-medium">{goalProgress.toFixed(0)}%</span>
              </div>
              <Progress value={goalProgress} className="h-3" />
            </div>
            {goalProgress >= 100 ? (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Congratulations! You've achieved today's goal 🎉
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                You're getting closer to your goal, keep going!
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No sessions recorded yet</p>
              <Button
                variant="link"
                onClick={() => onNavigate('timer')}
                className="mt-2"
              >
                Start your first session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${getSubjectColor(session.subjectId)}20` }}
                    >
                      <BookOpen
                        className="h-5 w-5"
                        style={{ color: getSubjectColor(session.subjectId) }}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{getSubjectName(session.subjectId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(session.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDuration(Number(session.duration))}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
