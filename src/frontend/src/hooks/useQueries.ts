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
      toast.success('Subject added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add subject');
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
      toast.success('Subject updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subject');
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
      toast.success('Subject deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete subject');
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
      toast.success('Daily goal saved successfully');
    },
    onError: () => {
      toast.error('Failed to save goal');
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
      toast.success('Session saved successfully');
    },
    onError: () => {
      toast.error('Failed to save session');
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
