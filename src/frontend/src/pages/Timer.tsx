import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useSubjects, useRecordSession } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudySession } from '../backend';

export default function Timer() {
  const { data: subjects = [], isLoading } = useSubjects();
  const recordSession = useRecordSession();

  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const handleStart = () => {
    if (!selectedSubject) {
      return;
    }

    if (!isRunning) {
      setStartTime(Date.now());
      setIsRunning(true);
      setIsPaused(false);
      setElapsedSeconds(0);
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    if (!isRunning || !startTime || !selectedSubject) return;

    const endTime = Date.now();
    const durationMinutes = Math.floor(elapsedSeconds / 60);

    if (durationMinutes > 0) {
      const session: StudySession = {
        subjectId: selectedSubject,
        duration: BigInt(durationMinutes),
        startTime: BigInt(startTime * 1000000),
        endTime: BigInt(endTime * 1000000),
        date: BigInt(new Date().setHours(0, 0, 0, 0) * 1000000),
      };

      await recordSession.mutateAsync(session);
    }

    setIsRunning(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    setStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject?.color || '#6366f1';
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Study Timer</h2>
        <p className="text-muted-foreground mt-1">Track your study time</p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timer
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject-select">Select Subject</Label>
            <Select
              value={selectedSubject}
              onValueChange={setSelectedSubject}
              disabled={isRunning}
            >
              <SelectTrigger id="subject-select">
                <SelectValue placeholder="Choose a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No subjects available
                  </div>
                ) : (
                  subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        {subject.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center py-12">
            <div
              className="text-7xl font-bold mb-8 font-mono tracking-wider"
              style={{
                color: selectedSubject ? getSubjectColor(selectedSubject) : undefined,
              }}
            >
              {formatTime(elapsedSeconds)}
            </div>

            {/* Timer Controls */}
            <div className="flex gap-3">
              {!isRunning ? (
                <Button
                  size="lg"
                  onClick={handleStart}
                  disabled={!selectedSubject}
                  className="gap-2 px-8"
                >
                  <Play className="h-5 w-5" />
                  Start
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handlePause}
                    className="gap-2 px-8"
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-5 w-5" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="h-5 w-5" />
                        Pause
                      </>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleStop}
                    disabled={recordSession.isPending}
                    className="gap-2 px-8"
                  >
                    <Square className="h-5 w-5" />
                    {recordSession.isPending ? 'Saving...' : 'Stop'}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Status Message */}
          {isRunning && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isPaused ? 'Timer paused' : 'Timer running...'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• First, select a subject</p>
          <p>• Press the "Start" button to begin</p>
          <p>• You can pause the timer if needed</p>
          <p>• Press "Stop" to save the session automatically</p>
          <p>• Sessions of at least 1 minute will be recorded</p>
        </CardContent>
      </Card>
    </div>
  );
}
