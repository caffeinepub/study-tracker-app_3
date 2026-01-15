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
        <h2 className="text-3xl font-bold">روزانہ کے اہداف</h2>
        <p className="text-muted-foreground mt-1">اپنے مطالعہ کے روزانہ اہداف مقرر کریں</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            ہدف کی ترتیبات
          </CardTitle>
          <CardDescription>
            اپنی ترجیح کے مطابق وقت یا کاموں کی بنیاد پر ہدف مقرر کریں
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={goalType} onValueChange={(v) => setGoalType(v as 'time' | 'task')}>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="time" id="time" />
                <Label htmlFor="time" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">وقت کی بنیاد پر</p>
                      <p className="text-sm text-muted-foreground">
                        روزانہ مطالعہ کے گھنٹے مقرر کریں
                      </p>
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse p-4 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
                <RadioGroupItem value="task" id="task" />
                <Label htmlFor="task" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">کاموں کی بنیاد پر</p>
                      <p className="text-sm text-muted-foreground">
                        روزانہ مطالعہ کے سیشن مقرر کریں
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="goal-value">
              {goalType === 'time' ? 'گھنٹے فی دن' : 'سیشن فی دن'}
            </Label>
            <Input
              id="goal-value"
              type="number"
              min="1"
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
              placeholder={goalType === 'time' ? 'مثال: 3' : 'مثال: 5'}
              dir="rtl"
            />
            <p className="text-sm text-muted-foreground">
              {goalType === 'time'
                ? 'آپ روزانہ کتنے گھنٹے مطالعہ کرنا چاہتے ہیں؟'
                : 'آپ روزانہ کتنے سیشن مکمل کرنا چاہتے ہیں؟'}
            </p>
          </div>

          <Button
            onClick={handleSaveGoal}
            disabled={!goalValue || parseInt(goalValue) <= 0 || setGoal.isPending}
            className="w-full"
          >
            {setGoal.isPending ? 'محفوظ ہو رہا ہے...' : 'ہدف محفوظ کریں'}
          </Button>
        </CardContent>
      </Card>

      {currentGoal && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">موجودہ ہدف</CardTitle>
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
                    ? `${Number(currentGoal.timeBased)} گھنٹے`
                    : `${Number(currentGoal.taskBased)} سیشن`}
                </p>
                <p className="text-sm text-muted-foreground">روزانہ کا ہدف</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تجاویز</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• حقیقت پسندانہ اہداف مقرر کریں جو آپ مسلسل حاصل کر سکیں</p>
          <p>• چھوٹے اہداف سے شروع کریں اور آہستہ آہستہ بڑھائیں</p>
          <p>• اپنی پیشرفت کو باقاعدگی سے چیک کریں</p>
          <p>• ضرورت کے مطابق اپنے اہداف کو ایڈجسٹ کریں</p>
        </CardContent>
      </Card>
    </div>
  );
}
