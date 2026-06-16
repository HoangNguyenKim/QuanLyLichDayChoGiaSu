import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, scheduleApi, studentApi, subjectApi } from '../api/endpoints';

export const useDashboardToday = () => useQuery({ queryKey: ['dashboard', 'today'], queryFn: dashboardApi.getToday });
export const useDashboardUpcoming = (days?: number) => useQuery({ queryKey: ['dashboard', 'upcoming', days], queryFn: () => dashboardApi.getUpcoming(days) });
export const useWeeklyIncome = () => useQuery({ queryKey: ['dashboard', 'income', 'weekly'], queryFn: dashboardApi.getWeeklyIncome });
export const useMonthlyIncome = () => useQuery({ queryKey: ['dashboard', 'income', 'monthly'], queryFn: dashboardApi.getMonthlyIncome });

export const useStudents = (page?: number, limit?: number, search?: string) => 
  useQuery({ queryKey: ['students', page, limit, search], queryFn: () => studentApi.getAll(page, limit, search) });

export const useSubjects = () => useQuery({ queryKey: ['subjects'], queryFn: subjectApi.getAll });

export const useWeeklySchedules = (date?: string) => 
  useQuery({ queryKey: ['schedules', 'weekly', date], queryFn: () => scheduleApi.getWeekly(date) });

// Mutations
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduleApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => scheduleApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });
};

export const useToggleCompleted = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => scheduleApi.markCompleted(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useToggleLessonPrepared = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => scheduleApi.markLessonPrepared(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });
};
