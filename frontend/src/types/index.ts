export interface Student {
  id: number;
  fullName: string;
  address?: string;
  apartmentFloor?: string;
  parentPhone?: string;
  parentPhone?: string;
  note?: string;
  tuitionFeePerSession?: number;
  previousUnpaidSessions?: number;
  createdAt?: string;
  updatedAt?: string;
  schedules?: Schedule[];
  subjects?: Subject[];
}

export interface Subject {
  id: number;
  name: string;
}

export interface Schedule {
  id: number;
  studentId: number;
  subjectId: number;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  locationDetail?: string;
  mode: 'ONLINE' | 'OFFLINE';
  note?: string;
  lessonPrepared: boolean;
  completed: boolean;
  isPaid: boolean;
  estimatedIncome?: number;
  actualIncome?: number;
  teachingNote?: string;
  student?: Student;
  subject?: Subject;
}

export interface DashboardToday {
  total: number;
  completed: number;
  pending: number;
  schedules: Schedule[];
}

export interface IncomeStats {
  estimated: number;
  actual: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  warning?: boolean;
  warningMessage?: string;
  error?: {
    code: string;
    message: string;
  };
}
