import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  useDashboardToday, 
  useDashboardUpcoming, 
  useIncomeStats,
  useToggleLessonPrepared
} from '@/hooks/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, BookOpen, MapPin, Flame, Briefcase, FileText } from 'lucide-react';
import { toast } from 'sonner';
import TodayWorkflowCard from '@/components/schedule/TodayWorkflowCard';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale/vi';

// Format currency
const formatCurrency = (value: number = 0) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data: todayResp, isLoading: isLoadingToday } = useDashboardToday();
  const { data: upcomingResp, isLoading: isLoadingUpcoming } = useDashboardUpcoming(7);
  const { data: incomeStatsResp } = useIncomeStats();
  const togglePrepared = useToggleLessonPrepared();

  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  const todayData = todayResp?.data;
  const upcomingData = upcomingResp?.data || [];
  const incomeStats = incomeStatsResp?.data;

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground drop-shadow-sm flex items-center gap-2">
            <span>Hi Gia Sư!</span> <span className="text-4xl">👋</span>
          </h1>
          <p className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50 hidden md:block">
            {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: vi })}
          </p>
        </motion.div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-card border-2 border-primary/40 shadow-md-pink hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden relative group">
              <div className="absolute -right-6 -top-6 text-primary/10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <BookOpen size={100} />
              </div>
              <CardHeader className="pb-2 relative z-10 bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <div className="p-2 bg-primary/20 rounded-2xl">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  Hôm nay
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 relative z-10">
                <div className="text-4xl font-black text-primary">
                  {isLoadingToday ? '...' : todayData?.total || 0} <span className="text-lg font-bold text-muted-foreground">ca</span>
                </div>
                <p className="text-sm font-semibold text-muted-foreground mt-2">
                  Đã xong: <span className="text-foreground">{todayData?.completed || 0}</span> / {todayData?.total || 0}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card border-2 border-pink-400/40 shadow-md-pink hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden relative group">
              <div className="absolute -right-6 -top-6 text-pink-500/10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Flame size={100} />
              </div>
              <CardHeader className="pb-2 relative z-10 bg-pink-50 border-b border-pink-100">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <div className="p-2 bg-pink-200/50 rounded-2xl">
                    <BookOpen className="w-5 h-5 text-pink-500" />
                  </div>
                  Bài cần soạn
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 relative z-10">
                <div className="text-4xl font-black text-pink-500">
                  {incomeStats?.lessons?.notPrepared || 0} <span className="text-lg font-bold text-muted-foreground">bài</span>
                </div>
                <p className="text-sm font-semibold text-muted-foreground mt-2">
                  Đang chờ bạn chuẩn bị
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-card border-2 border-amber-400/40 shadow-md-pink hover:-translate-y-1 hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden relative group">
              <div className="absolute -right-6 -top-6 text-amber-500/10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <BookOpen size={100} />
              </div>
              <CardHeader className="pb-2 relative z-10 bg-amber-50 border-b border-amber-100">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                  <div className="p-2 bg-amber-200/50 rounded-2xl">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                  </div>
                  Bài đã soạn
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 relative z-10">
                <div className="text-4xl font-black text-amber-500">
                  {incomeStats?.lessons?.prepared || 0} <span className="text-lg font-bold text-muted-foreground">bài</span>
                </div>
                <p className="text-sm font-semibold text-muted-foreground mt-2">
                  Sẵn sàng cho buổi học
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* TODAY WORKFLOW */}
        <motion.div variants={itemVariants}>
          <TodayWorkflowCard />
        </motion.div>

        {/* UPCOMING SCHEDULES */}
        <motion.div variants={itemVariants} className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Lịch sắp tới</span> 
              <span>✨</span>
            </h2>
          </div>

          {isLoadingUpcoming ? (
            <div className="text-center py-10 text-muted-foreground animate-pulse font-medium">
              Đang tải lịch...
            </div>
          ) : upcomingData.length > 0 ? (
            <div className="space-y-4">
              {upcomingData.map((schedule) => (
                <Card 
                  key={schedule.id} 
                  className="bg-card border-2 border-primary/20 shadow-soft hover:shadow-md-pink hover:-translate-y-1 rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedSchedule(schedule)}
                >
                  <CardContent className="p-0 flex flex-col sm:flex-row bg-card">
                    <div className="bg-primary/5 sm:w-32 flex flex-row sm:flex-col items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-primary/20">
                      <div className="text-sm font-bold text-primary uppercase">
                        {schedule.date ? format(parseISO(schedule.date), 'EEEE', { locale: vi }) : 'N/A'}
                      </div>
                      <div className="text-3xl font-black text-foreground mt-1">
                        {schedule.date ? format(parseISO(schedule.date), 'dd/MM') : '--/--'}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {schedule.student?.fullName || 'Học sinh'}
                          </h3>
                          <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1 mt-1">
                            <BookOpen className="w-4 h-4 text-accent" /> {schedule.subject?.name || 'Môn học'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold bg-accent/10 text-accent px-3 py-1 rounded-full">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground mt-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-secondary-foreground" /> {schedule.mode === 'ONLINE' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border/60 bg-muted/20 shadow-none rounded-3xl">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-primary/10 p-6 rounded-full mb-4">
                  <Calendar className="w-12 h-12 text-primary opacity-80" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Trống lịch rồi!</h3>
                <p className="text-muted-foreground font-medium max-w-[250px]">
                  Bạn không có lịch dạy nào trong những ngày tới. Hãy dành thời gian nghỉ ngơi nhé! 🍵
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* Schedule Detail Dialog */}
      <Dialog open={!!selectedSchedule} onOpenChange={(open) => !open && setSelectedSchedule(null)}>
        <DialogContent className="rounded-3xl border-primary/20 max-w-md w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-foreground text-center flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Chi tiết lịch dạy
            </DialogTitle>
          </DialogHeader>
          
          {selectedSchedule && (
            <div className="space-y-4 py-2">
              <div className="bg-white p-5 rounded-2xl border-2 border-primary/20 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                  <h3 className="font-bold text-xl text-foreground">{selectedSchedule.student?.fullName || 'Học sinh'}</h3>
                  <span className="text-xs font-bold bg-accent/30 text-foreground px-3 py-1.5 rounded-full shadow-sm">
                    {selectedSchedule.mode === 'ONLINE' ? '🌐 Online' : '📍 Offline'}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <BookOpen className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">Môn: <span className="font-bold text-primary">{selectedSchedule.subject?.name || 'Chưa rõ'}</span></span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/10 rounded-xl">
                      <Calendar className="w-4 h-4 text-pink-500" />
                    </div>
                    <span className="font-medium">Thời gian: <span className="font-bold">
                      {selectedSchedule.date ? format(parseISO(selectedSchedule.date), 'dd/MM/yyyy') : ''} • {selectedSchedule.startTime} - {selectedSchedule.endTime}
                    </span></span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl mt-0.5 shrink-0">
                      <MapPin className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="leading-relaxed font-medium mt-1">
                      Địa điểm: <span className="font-bold">
                        {selectedSchedule.location || selectedSchedule.student?.address || 'Chưa có thông tin'}
                      </span>
                    </span>
                  </div>

                  {(selectedSchedule.locationDetail || selectedSchedule.student?.apartmentFloor) && (
                    <div className="ml-12 text-sm text-muted-foreground font-medium bg-muted/20 p-2 rounded-lg">
                      {selectedSchedule.student?.apartmentFloor && <p>Tầng/Phòng: <span className="font-bold text-foreground">{selectedSchedule.student.apartmentFloor}</span></p>}
                      {selectedSchedule.locationDetail && <p>Chi tiết: <span className="font-bold text-foreground">{selectedSchedule.locationDetail}</span></p>}
                    </div>
                  )}
                  
                  {selectedSchedule.note && (
                    <div className="mt-4 p-3 bg-secondary/30 rounded-xl border border-secondary/50 italic text-foreground font-medium">
                      "{selectedSchedule.note}"
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  onClick={() => {
                    togglePrepared.mutate(selectedSchedule.id, {
                      onSuccess: () => {
                        toast.success(selectedSchedule.lessonPrepared ? 'Đã bỏ đánh dấu soạn bài' : 'Đã đánh dấu soạn bài xong!');
                        // Update local state to reflect change instantly in dialog
                        setSelectedSchedule({
                          ...selectedSchedule,
                          lessonPrepared: !selectedSchedule.lessonPrepared
                        });
                      }
                    });
                  }}
                  className={`w-full py-6 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                    selectedSchedule.lessonPrepared 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 shadow-none' 
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md-pink'
                  }`}
                  disabled={togglePrepared.isPending}
                >
                  <FileText className="w-5 h-5" />
                  <span className="font-bold text-base">
                    {selectedSchedule.lessonPrepared ? 'Đã hoàn thành soạn bài' : 'Đánh dấu đã soạn bài xong'}
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSchedule(null)}
                  className="rounded-2xl"
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
