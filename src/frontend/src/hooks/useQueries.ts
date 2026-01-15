import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Subject, StudySession, GoalType } from '../backend';
import { toast } from 'sonner';

// Subjects
export function useSubjects() {
  const { actor, isFetching } = useActor();

  return useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name: string; color: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addSubject(id, name, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('مضمون کامیابی سے شامل ہوگیا');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'مضمون شامل کرنے میں خرابی');
    },
  });
}

export function useEditSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name: string; color: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.editSubject(id, name, color);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('مضمون کامیابی سے اپ ڈیٹ ہوگیا');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'مضمون اپ ڈیٹ کرنے میں خرابی');
    },
  });
}

export function useRemoveSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.removeSubject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('مضمون کامیابی سے حذف ہوگیا');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'مضمون حذف کرنے میں خرابی');
    },
  });
}

// Goals
export function useDailyGoal() {
  const { actor, isFetching } = useActor();

  return useQuery<GoalType | null>({
    queryKey: ['dailyGoal'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDailyGoal();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetDailyGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: GoalType) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.setDailyGoal(goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyGoal'] });
      toast.success('روزانہ کا ہدف محفوظ ہوگیا');
    },
    onError: () => {
      toast.error('ہدف محفوظ کرنے میں خرابی');
    },
  });
}

// Sessions
export function useStudySessions() {
  const { actor, isFetching } = useActor();

  return useQuery<StudySession[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStudySessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: StudySession) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.recordSession(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('سیشن کامیابی سے محفوظ ہوگیا');
    },
    onError: () => {
      toast.error('سیشن محفوظ کرنے میں خرابی');
    },
  });
}

export function useWeeklySessions(weekStart: bigint, weekEnd: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<StudySession[]>({
    queryKey: ['weeklySessions', weekStart.toString(), weekEnd.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWeeklySessions(weekStart, weekEnd);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubjectSessions(subjectId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<StudySession[]>({
    queryKey: ['subjectSessions', subjectId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjectSessions(subjectId);
    },
    enabled: !!actor && !isFetching && !!subjectId,
  });
}
