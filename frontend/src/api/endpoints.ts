import axiosClient from './axiosClient';
import type { ApiResponse, DashboardToday, IncomeStats, Schedule, Student, Subject } from '../types';

export const dashboardApi = {
  getToday: () => axiosClient.get<any, ApiResponse<DashboardToday>>('/dashboard/today'),
  getUpcoming: (days: number = 7) => axiosClient.get<any, ApiResponse<Schedule[]>>(`/dashboard/upcoming?days=${days}`),
  getWeeklyIncome: () => axiosClient.get<any, ApiResponse<IncomeStats>>('/dashboard/income/weekly'),
  getMonthlyIncome: () => axiosClient.get<any, ApiResponse<IncomeStats>>('/dashboard/income/monthly'),
  getIncomeStats: () => axiosClient.get<any, ApiResponse<any>>('/dashboard/income/stats'),
  getTodos: () => axiosClient.get<any, ApiResponse<any>>('/dashboard/todos'),
};

export const studentApi = {
  getAll: (page: number = 1, limit: number = 50, search?: string) => 
    axiosClient.get<any, ApiResponse<Student[]>>('/students', { params: { page, limit, search } }),
  getById: (id: number) => axiosClient.get<any, ApiResponse<Student>>(`/students/${id}`),
  create: (data: Partial<Student> & { subjectIds?: number[] }) => axiosClient.post<any, ApiResponse<Student>>('/students', data),
  update: (id: number, data: Partial<Student> & { subjectIds?: number[] }) => axiosClient.put<any, ApiResponse<Student>>(`/students/${id}`, data),
  delete: (id: number) => axiosClient.delete<any, ApiResponse<void>>(`/students/${id}`),
};

export const subjectApi = {
  getAll: () => axiosClient.get<any, ApiResponse<Subject[]>>('/subjects'),
  create: (data: { name: string }) => axiosClient.post<any, ApiResponse<Subject>>('/subjects', data),
};

export const scheduleApi = {
  getWeekly: (date?: string) => axiosClient.get<any, ApiResponse<Schedule[]>>('/schedules/weekly', { params: { date } }),
  getMonthly: (date?: string) => axiosClient.get<any, ApiResponse<Schedule[]>>('/schedules/monthly', { params: { date } }),
  getAll: (params?: { studentId?: number, subjectId?: number, completed?: string, date?: string, page?: number, limit?: number }) => 
    axiosClient.get<any, ApiResponse<Schedule[]>>('/schedules', { params }),
  create: (data: Partial<Schedule>) => axiosClient.post<any, ApiResponse<Schedule>>('/schedules', data),
  update: (id: number, data: Partial<Schedule>) => axiosClient.put<any, ApiResponse<Schedule>>(`/schedules/${id}`, data),
  delete: (id: number) => axiosClient.delete<any, ApiResponse<void>>(`/schedules/${id}`),
  markCompleted: (id: number) => axiosClient.patch<any, ApiResponse<Schedule>>(`/schedules/${id}/complete`),
  markLessonPrepared: (id: number) => axiosClient.patch<any, ApiResponse<Schedule>>(`/schedules/${id}/lesson-prepared`),
  checkConflict: (data: { date: string, startTime: string, endTime: string, excludeId?: number }) => 
    axiosClient.post<any, ApiResponse<any>>('/schedules/check-conflict', data),
};
