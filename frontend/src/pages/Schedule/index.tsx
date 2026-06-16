import { useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventContentArg, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';
import { format } from 'date-fns';
import { useWeeklySchedules, useUpdateSchedule } from '../../hooks/queries';
import { Monitor, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import './schedule.css';

const SchedulePage = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const { data: response } = useWeeklySchedules(format(currentDate, 'yyyy-MM-dd'));
  const { mutateAsync: updateSchedule } = useUpdateSchedule();

  const events = response?.data?.map((schedule) => {
    return {
      id: schedule.id.toString(),
      start: `${schedule.date}T${schedule.startTime}`,
      end: `${schedule.date}T${schedule.endTime}`,
      extendedProps: {
        studentName: schedule.student?.fullName || 'Unknown Student',
        subjectName: schedule.subject?.name || 'Unknown Subject',
        mode: schedule.mode,
        lessonPrepared: schedule.lessonPrepared,
        completed: schedule.completed,
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
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-pink-800 flex items-center gap-2">
          📅 Weekly Schedule
        </h1>
      </div>
      
      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-soft border border-pink-100">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          events={events}
          editable={true}
          droppable={true}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
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
  );
};

export default SchedulePage;
