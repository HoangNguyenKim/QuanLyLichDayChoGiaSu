import { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import type { EventContentArg, EventDropArg, EventReceiveArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { useWeeklySchedules, useUpdateSchedule, useStudents, useCreateSchedule, useSubjects, useDeleteSchedule, useCopyLastWeekSchedules } from '../../hooks/queries';
import { Monitor, MapPin, CheckCircle2, Loader2, Trash2, Clock, Copy } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
  const { mutateAsync: copyLastWeek, isPending: isCopyingLastWeek } = useCopyLastWeekSchedules();

  const [pendingSchedule, setPendingSchedule] = useState<any>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [lessonPrepared, setLessonPrepared] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
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
    setCompleted(event.extendedProps.completed || false);
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
            completed,
          }
        });
        toast.success('Cập nhật nội dung thành công!');
        pendingSchedule.fcEvent.setExtendedProp('lessonPrepared', lessonPrepared);
        pendingSchedule.fcEvent.setExtendedProp('completed', completed);
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

    // Lấy 2 chữ cuối của tên học sinh
    const nameWords = studentName.trim().split(/\s+/);
    const shortNameWords = nameWords.length > 2 ? nameWords.slice(-2) : nameWords;

    const cardStyles = completed
      ? 'bg-gradient-to-br from-emerald-50/90 to-teal-100/50 border-y-emerald-200/60 border-r-emerald-200/60 border-l-[5px] border-l-emerald-500 text-emerald-950'
      : 'bg-gradient-to-br from-blue-50/90 to-indigo-100/50 border-y-blue-200/60 border-r-blue-200/60 border-l-[5px] border-l-blue-500 text-slate-800';

    return (
      <div className={`w-full h-full p-3 flex flex-col gap-1.5 rounded-[1.25rem] border ${cardStyles} shadow-sm backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.01] group`}>
        {/* Soft background glow for premium feel */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/60 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

        {/* Absolute Icons -> Moved to normal flow at the top */}
        <div className="flex justify-end w-full relative z-10">
          <div className="flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-full shadow-sm backdrop-blur-md border border-white/60">
            {lessonPrepared && (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" title="Đã soạn bài" />
            )}
            {mode === 'ONLINE' ? (
              <Monitor size={14} className={completed ? 'text-emerald-600' : 'text-blue-600'} />
            ) : (
              <MapPin size={14} className="text-orange-500" />
            )}
          </div>
        </div>

        {/* Top Header - Name */}
        <div className="flex flex-col gap-0 relative z-10 mt-1">
          {shortNameWords.map((word: string, index: number) => (
            <div key={index} className="font-extrabold text-xs md:text-[13px] uppercase tracking-tight leading-none mb-1 opacity-90 drop-shadow-sm break-words whitespace-normal">
              {word}
            </div>
          ))}
        </div>
        
        {/* Subject */}
        <div className="text-xs md:text-sm font-semibold opacity-75 break-words whitespace-normal mt-1 relative z-10 flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${completed ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
          <span className="leading-tight">{subjectName}</span>
        </div>
        
        {/* Time - Elegant pill pushed to bottom */}
        <div className={`flex items-center gap-1.5 text-[11px] md:text-xs font-bold mt-auto w-fit px-2.5 py-1 rounded-full shadow-sm border bg-white/80 backdrop-blur-md relative z-10 ${completed ? 'border-emerald-200 text-emerald-700' : 'border-blue-200 text-blue-700'}`}>
          <Clock size={13} />
          <span>{eventInfo.timeText}</span>
        </div>
        
        {/* Completed Watermark */}
        {completed && (
          <CheckCircle2 className="absolute -bottom-4 -right-4 text-emerald-500/10 pointer-events-none" size={120} strokeWidth={1} />
        )}
      </div>
    );
  };

  return (
    <div className="p-2 lg:p-3 xl:p-4 w-full max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-3 lg:gap-4 xl:gap-5 animate-in fade-in zoom-in-95 duration-300 h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)]">
      
      {/* Sidebar for Students */}
      <div className="w-full lg:w-48 xl:w-60 bg-white rounded-2xl lg:rounded-3xl p-3 lg:p-3 xl:p-4 shadow-soft border border-pink-100 flex-shrink-0 flex flex-col h-auto lg:h-full lg:sticky lg:top-3 z-10">
        <h2 className="text-lg font-bold text-pink-800 mb-1 flex items-center gap-2">
          🧸 Học sinh
        </h2>
        <p className="text-[11px] lg:text-xs text-slate-500 mb-2 pb-2 border-b border-pink-50 hidden lg:block leading-tight">
          Kéo học sinh và thả vào lịch để xếp lịch.
        </p>
        <div ref={externalEventsRef} className="flex-1 overflow-x-auto lg:overflow-x-hidden overflow-y-hidden lg:overflow-y-auto flex flex-row lg:flex-col gap-2 pb-2 lg:pb-0 lg:pr-1 scrollbar-thin">
          {isLoadingStudents ? (
            <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : students.length === 0 ? (
            <div className="text-xs text-slate-400 italic text-center py-4">Chưa có học sinh</div>
          ) : students.map(student => (
            <div 
              key={student.id}
              className="fc-event p-2 lg:p-2.5 xl:p-3 bg-gradient-to-br from-pastel-blue to-blue-50 text-blue-900 rounded-xl lg:rounded-2xl cursor-grab active:cursor-grabbing border border-blue-200/60 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 min-w-[120px] lg:min-w-0 flex-shrink-0"
              data-id={student.id}
              data-title={student.fullName}
              data-subject-id={student.subjects?.[0]?.subjectId || 0}
            >
              <div className="font-semibold text-xs lg:text-sm truncate leading-tight">{student.fullName}</div>
              <div className="text-[10px] lg:text-xs text-blue-600/80 mt-0.5 flex items-center gap-1 truncate">
                <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-blue-400"></span>
                {student.subjects?.[0]?.subject?.name || 'Chưa gán môn'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-3 pl-2">
          <h1 className="text-xl md:text-2xl font-bold text-pink-800 flex items-center gap-2">
            📅 Lịch Dạy Của Bạn
          </h1>
          <Button
            onClick={async () => {
              try {
                const res = await copyLastWeek(format(currentDate, 'yyyy-MM-dd'));
                toast.success(`Đã copy thành công ${res?.data?.copied || 0} buổi dạy!`);
              } catch (e: any) {
                toast.error(e?.message || 'Có lỗi khi copy lịch');
              }
            }}
            disabled={isCopyingLastWeek}
            variant="outline"
            className="rounded-xl border-pink-200 text-pink-700 hover:bg-pink-50"
          >
            {isCopyingLastWeek ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
            <span className="hidden sm:inline">Copy tuần trước</span>
            <span className="sm:hidden">Copy</span>
          </Button>
        </div>
        
        <div className="bg-white rounded-2xl lg:rounded-3xl p-2 lg:p-5 shadow-soft border border-pink-100 flex-1 overflow-hidden flex flex-col">
          <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
          headerToolbar={{
            left: isMobile ? 'prev,next' : 'prev,next today',
            center: 'title',
            right: isMobile ? 'today' : 'timeGridWeek,timeGridDay'
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
          height="100%"
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
            
            <div className="flex flex-col gap-2">
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
              
              {isEditMode && (
                <div className="flex items-center space-x-3 bg-secondary/10 p-3 rounded-xl">
                  <Checkbox 
                    id="completed" 
                    checked={completed}
                    onCheckedChange={(checked) => setCompleted(checked as boolean)}
                  />
                  <label htmlFor="completed" className="text-sm font-medium leading-none cursor-pointer">
                    Đã hoàn thành buổi dạy này
                  </label>
                </div>
              )}
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
