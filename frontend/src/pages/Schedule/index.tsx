import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import type { EventContentArg, EventDropArg, EventReceiveArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { useWeeklySchedules, useUpdateSchedule, useStudents, useCreateSchedule, useSubjects, useDeleteSchedule } from '../../hooks/queries';
import { Monitor, MapPin, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import './schedule.css';

const SchedulePage = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const externalEventsRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const { data: response } = useWeeklySchedules(format(currentDate, 'yyyy-MM-dd'));
  const { data: studentsResponse, isLoading: isLoadingStudents } = useStudents();
  const students = studentsResponse?.data || [];
  
  const { data: subjectsResponse } = useSubjects();
  const allSubjects = subjectsResponse?.data || [];
  
  const studentsRef = useRef(students);
  useEffect(() => {
    studentsRef.current = students;
  }, [students]);
  
  const { mutateAsync: updateSchedule } = useUpdateSchedule();
  const { mutateAsync: createSchedule } = useCreateSchedule();
  const { mutateAsync: deleteSchedule } = useDeleteSchedule();

  const [pendingSchedule, setPendingSchedule] = useState<any>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [lessonPrepared, setLessonPrepared] = useState<boolean>(false);
  const [teachingNote, setTeachingNote] = useState<string>('');

  useEffect(() => {
    let draggable: Draggable | null = null;
    if (externalEventsRef.current) {
      draggable = new Draggable(externalEventsRef.current, {
        itemSelector: '.fc-event',
        eventData: function(eventEl) {
          const id = eventEl.getAttribute('data-id');
          const title = eventEl.getAttribute('data-title');
          const subjectId = eventEl.getAttribute('data-subject-id');
          return {
            id: `pending_${id}_${Date.now()}`,
            title: title,
            duration: '02:00',
            create: true,
            extendedProps: {
              studentId: Number(id),
              subjectId: Number(subjectId),
              studentName: title
            }
          };
        }
      });
    }
    return () => {
      draggable?.destroy();
    };
  }, []);

  const events = response?.data?.map((schedule) => {
    const dateStr = schedule.date.includes('T') ? schedule.date.split('T')[0] : schedule.date;
    return {
      id: schedule.id.toString(),
      start: `${dateStr}T${schedule.startTime}`,
      end: `${dateStr}T${schedule.endTime}`,
      extendedProps: {
        studentName: schedule.student?.fullName || 'Unknown Student',
        subjectName: schedule.subject?.name || 'Unknown Subject',
        mode: schedule.mode,
        lessonPrepared: schedule.lessonPrepared,
        completed: schedule.completed,
        teachingNote: schedule.teachingNote,
      },
    };
  }) || [];

  const handleEventDrop = async (info: EventDropArg) => {
    const { event } = info;
    const newDate = format(event.start!, 'yyyy-MM-dd');
    const newStartTime = format(event.start!, 'HH:mm');
    const newEndTime = event.end ? format(event.end, 'HH:mm') : newStartTime;

    try {
      const res = await updateSchedule({
        id: Number(event.id),
        data: {
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
        },
      });

      if (res?.warning) {
        toast.warning(res.warningMessage || 'Schedule updated with warning');
      } else {
        toast.success('Schedule updated successfully');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update schedule');
      info.revert();
    }
  };

  const handleEventResize = async (info: EventResizeDoneArg) => {
    const { event } = info;
    const newDate = format(event.start!, 'yyyy-MM-dd');
    const newStartTime = format(event.start!, 'HH:mm');
    const newEndTime = event.end ? format(event.end, 'HH:mm') : newStartTime;

    try {
      const res = await updateSchedule({
        id: Number(event.id),
        data: {
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
        },
      });

      if (res?.warning) {
        toast.warning(res.warningMessage || 'Schedule updated with warning');
      } else {
        toast.success('Schedule updated successfully');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update schedule');
      info.revert();
    }
  };

  const handleEventReceive = async (info: EventReceiveArg) => {
    const { event } = info;
    const studentId = event.extendedProps.studentId;
    
    const student = studentsRef.current.find((s: any) => s.id === studentId);
    
    if (!student) {
      toast.error('Không tìm thấy thông tin học sinh!');
      event.remove();
      return;
    }
    
    // Determine available subjects for the dropdown
    const availableSubjects = student.subjects && student.subjects.length > 0 
      ? student.subjects.map((s: any) => s.subject)
      : allSubjects;
      
    if (availableSubjects.length === 0) {
      toast.error('Chưa có môn học nào trong hệ thống! Vui lòng thêm môn học trước.');
      event.remove();
      return;
    }

    const newDate = format(event.start!, 'yyyy-MM-dd');
    const newStartTime = format(event.start!, 'HH:mm');
    
    let newEndTime;
    if (event.end) {
      newEndTime = format(event.end, 'HH:mm');
    } else {
      const defaultEndDate = new Date(event.start!);
      defaultEndDate.setHours(defaultEndDate.getHours() + 2);
      newEndTime = format(defaultEndDate, 'HH:mm');
    }

    setPendingSchedule({
      studentId,
      studentName: student.fullName,
      subjects: availableSubjects,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      fcEvent: event,
    });
    setSelectedSubjectId(student.subjects?.[0]?.subjectId || availableSubjects[0]?.id || 0);
    setTeachingNote('');
    setLessonPrepared(false);
    setIsEditMode(false);
    setIsScheduleDialogOpen(true);
  };

  const handleEventClick = (info: any) => {
    const { event } = info;
    setPendingSchedule({
      id: Number(event.id),
      studentName: event.extendedProps.studentName,
      fcEvent: event, // for reference
    });
    setTeachingNote(event.extendedProps.teachingNote || '');
    setLessonPrepared(event.extendedProps.lessonPrepared || false);
    setIsEditMode(true);
    setIsScheduleDialogOpen(true);
  };

  const handleConfirmSchedule = async () => {
    if (!pendingSchedule) return;

    try {
      if (isEditMode) {
        await updateSchedule({
          id: pendingSchedule.id,
          data: {
            teachingNote,
            lessonPrepared,
          }
        });
        toast.success('Cập nhật nội dung thành công!');
        pendingSchedule.fcEvent.setExtendedProp('lessonPrepared', lessonPrepared);
        pendingSchedule.fcEvent.setExtendedProp('teachingNote', teachingNote);
      } else {
        const res = await createSchedule({
          studentId: pendingSchedule.studentId,
          subjectId: selectedSubjectId,
          date: pendingSchedule.date,
          startTime: pendingSchedule.startTime,
          endTime: pendingSchedule.endTime,
          teachingNote,
          lessonPrepared,
          mode: 'OFFLINE',
        });

        if (res?.warning) {
          toast.warning(res.warningMessage || 'Đã xếp lịch nhưng có cảnh báo trùng giờ');
        } else {
          toast.success('Xếp lịch thành công!');
        }
        
        const newSubject = allSubjects.find((s: any) => s.id === selectedSubjectId);
        pendingSchedule.fcEvent.setProp('id', res.data.id.toString());
        pendingSchedule.fcEvent.setExtendedProp('subjectName', newSubject?.name || 'Môn học');
        pendingSchedule.fcEvent.setExtendedProp('lessonPrepared', lessonPrepared);
        pendingSchedule.fcEvent.setExtendedProp('teachingNote', teachingNote);
        pendingSchedule.fcEvent.setExtendedProp('mode', 'OFFLINE');
        pendingSchedule.fcEvent.setExtendedProp('completed', false);
      }
      
      setIsScheduleDialogOpen(false);
      setPendingSchedule(null);
    } catch (error: any) {
      toast.error(error?.message || 'Lỗi khi lưu ca học');
    }
  };

  const handleDeleteSchedule = async () => {
    if (!pendingSchedule || !isEditMode) return;
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa ca học này?')) return;
    
    try {
      await deleteSchedule(pendingSchedule.id);
      toast.success('Xóa ca học thành công!');
      pendingSchedule.fcEvent.remove();
      setIsScheduleDialogOpen(false);
      setPendingSchedule(null);
    } catch (error: any) {
      toast.error(error?.message || 'Lỗi khi xóa ca học');
    }
  };

  const renderEventContent = (eventInfo: EventContentArg) => {
    const { studentName, subjectName, mode, lessonPrepared, completed } = eventInfo.event.extendedProps;
    
    // Pastel color based on completion or default
    const bgColor = completed ? 'bg-green-100' : 'bg-pastel-blue';
    const borderColor = completed ? 'border-green-300' : 'border-blue-200';
    const textColor = completed ? 'text-green-800' : 'text-blue-800';

    return (
      <div className={`w-full h-full p-2 flex flex-col gap-1 rounded-2xl border-2 ${borderColor} ${bgColor} ${textColor} shadow-soft relative overflow-hidden`}>
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="font-bold text-sm truncate pr-2" title={studentName}>
            {studentName}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {lessonPrepared && (
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" title="Lesson Prepared" />
            )}
            {mode === 'ONLINE' ? (
              <Monitor size={14} className="text-blue-600" />
            ) : (
              <MapPin size={14} className="text-orange-500" />
            )}
          </div>
        </div>
        
        {/* Subject */}
        <div className="text-xs font-medium opacity-80 truncate">
          {subjectName}
        </div>
        
        {/* Time - Optional, FullCalendar usually shows it but we can customize */}
        <div className="text-[10px] font-semibold mt-auto opacity-70">
          {eventInfo.timeText}
        </div>
        
        {/* Completed Overlay Icon */}
        {completed && (
          <CheckCircle2 className="absolute bottom-1 right-1 text-green-500 opacity-50" size={24} />
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Sidebar for Students */}
      <div className="w-full md:w-72 bg-white rounded-3xl p-5 shadow-soft border border-pink-100 flex-shrink-0 flex flex-col max-h-[85vh] md:sticky md:top-6 z-10">
        <h2 className="text-xl font-bold text-pink-800 mb-2 flex items-center gap-2">
          🧸 Học sinh
        </h2>
        <p className="text-sm text-slate-500 mb-4 pb-4 border-b border-pink-50">
          Kéo học sinh và thả vào lịch để xếp lịch dạy nhanh chóng.
        </p>
        <div ref={externalEventsRef} className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 scrollbar-thin">
          {isLoadingStudents ? (
            <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : students.length === 0 ? (
            <div className="text-sm text-slate-400 italic text-center py-4">Chưa có học sinh</div>
          ) : students.map(student => (
            <div 
              key={student.id}
              className="fc-event p-3.5 bg-gradient-to-br from-pastel-blue to-blue-50 text-blue-900 rounded-2xl cursor-grab active:cursor-grabbing border border-blue-200/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
              data-id={student.id}
              data-title={student.fullName}
              data-subject-id={student.subjects?.[0]?.subjectId || 0}
            >
              <div className="font-semibold text-sm truncate">{student.fullName}</div>
              <div className="text-xs text-blue-600/80 mt-1 flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                {student.subjects?.[0]?.subject?.name || 'Chưa gán môn'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-4 pl-2">
          <h1 className="text-2xl md:text-3xl font-bold text-pink-800 flex items-center gap-2">
            📅 Lịch Dạy Của Bạn
          </h1>
        </div>
        
        <div className="bg-white rounded-3xl p-4 md:p-6 shadow-soft border border-pink-100 flex-1">
          <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          firstDay={1}
          events={events}
          editable={true}
          droppable={true}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventReceive={handleEventReceive}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          allDaySlot={false}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          height="auto"
          expandRows={true}
          nowIndicator={true}
          datesSet={(arg) => setCurrentDate(arg.view.currentStart)}
        />
        </div>
      </div>

      <Dialog open={isScheduleDialogOpen} onOpenChange={(open) => {
        if (!open && pendingSchedule && !isEditMode) {
           pendingSchedule.fcEvent.remove();
        }
        if (!open) {
           setPendingSchedule(null);
        }
        setIsScheduleDialogOpen(open);
      }}>
        <DialogContent className="rounded-3xl border-primary/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl text-foreground text-center">
              {isEditMode ? `Cập nhật nội dung: ${pendingSchedule?.studentName}` : `Xếp lịch cho ${pendingSchedule?.studentName}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!isEditMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Môn học (Bắt buộc)</label>
                <select 
                  className="w-full p-3 border border-primary/20 rounded-xl bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                >
                  {pendingSchedule?.subjects?.map((subject: any) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú môn học buổi đó</label>
              <Input 
                placeholder="VD: Ôn tập toán hình..." 
                value={teachingNote}
                onChange={(e) => setTeachingNote(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3 bg-secondary/10 p-3 rounded-xl">
              <Checkbox 
                id="prepared" 
                checked={lessonPrepared}
                onCheckedChange={(checked) => setLessonPrepared(checked as boolean)}
              />
              <label htmlFor="prepared" className="text-sm font-medium leading-none cursor-pointer">
                Đã soạn bài cho buổi này
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 items-center">
            {isEditMode && (
              <Button 
                variant="destructive" 
                className="rounded-xl mr-auto" 
                onClick={handleDeleteSchedule}
                disabled={deleteSchedule.isPending}
              >
                {deleteSchedule.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Xóa
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl" onClick={() => {
                if (!isEditMode) {
                  pendingSchedule?.fcEvent.remove();
                }
                setPendingSchedule(null);
                setIsScheduleDialogOpen(false);
              }}>
                Hủy
              </Button>
              <Button className="rounded-xl" disabled={updateSchedule.isPending || createSchedule.isPending} onClick={handleConfirmSchedule}>
                {(updateSchedule.isPending || createSchedule.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditMode ? 'Lưu cập nhật' : 'Lưu ca học'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchedulePage;
