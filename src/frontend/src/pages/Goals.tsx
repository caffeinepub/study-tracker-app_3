import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Target, Clock, CheckCircle2 } from 'lucide-react';
import { useDailyGoal, useSetDailyGoal } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import type { GoalType } from '../backend';

export default function Goals() {
  const { data: currentGoal, isLoading } = useDailyGoal();
  const setGoal = useSetDailyGoal();

  const [goalType, setGoalType] = useState<'time' | 'task'>('time');
  const [goalValue, setGoalValue] = useState<string>('');

  useEffect(() => {
    if (currentGoal) {
      if (currentGoal.__kind__ === 'timeBased') {
        setGoalType('time');
        setGoalValue(Number(currentGoal.timeBased).toString());
      } else {
        setGoalType('task');
        setGoalValue(Number(currentGoal.taskBased).toString());
      }
    }
  }, [currentGoal]);

  const handleSaveGoal = async () => {
    const value = parseInt(goalValue);
    if (isNaN(value) || value <= 0) return;

    const goal: GoalType =
      goalType === 'time'
        ? { __kind__: 'timeBased', timeBased: BigInt(value) }
        : { __kind__: 'taskBased', taskBased: BigInt(value) };

    await setGoal.mutateAsync(goal);
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
        <h2 className="text-3xl font-bold">Daily Goals</h2>
        <p className="text-muted-foreground mt-1">Set your daily study goals</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Goal Settings
          </CardTitle>
          <CardDescription>
            Set goals based on time or tasks according to your preference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={goalType} onValueChange={(v) => setGoalType(v as 'time' | 'task')}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="time" id="time" />
                <Label htmlFor="time" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Time-Based</p>
                      <p className="text-sm text-muted-foreground">
                        Set daily study hours
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="task" id="task" />
                <Label htmlFor="task" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Task-Based</p>
                      <p className="text-sm text-muted-foreground">
                        Set daily study sessions
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="goal-value">
              {goalType === 'time' ? 'Hours per day' : 'Sessions per day'}
            </Label>
            <Input
              id="goal-value"
              type="number"
              min="1"
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
              placeholder={goalType === 'time' ? 'e.g., 3' : 'e.g., 5'}
            />
            <p className="text-sm text-muted-foreground">
              {goalType === 'time'
                ? 'How many hours do you want to study daily?'
                : 'How many sessions do you want to complete daily?'}
            </p>
          </div>

          <Button
            onClick={handleSaveGoal}
            disabled={!goalValue || parseInt(goalValue) <= 0 || setGoal.isPending}
            className="w-full"
          >
            {setGoal.isPending ? 'Saving...' : 'Save Goal'}
          </Button>
        </CardContent>
      </Card>

      {currentGoal && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Current Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                {currentGoal.__kind__ === 'timeBased' ? (
                  <Clock className="h-6 w-6 text-primary" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {currentGoal.__kind__ === 'timeBased'
                    ? `${Number(currentGoal.timeBased)} hours`
                    : `${Number(currentGoal.taskBased)} sessions`}
                </p>
                <p className="text-sm text-muted-foreground">Daily goal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Set realistic goals that you can consistently achieve</p>
          <p>• Start with smaller goals and gradually increase</p>
          <p>• Check your progress regularly</p>
          <p>• Adjust your goals as needed</p>
        </CardContent>
      </Card>
    </div>
  );
}
