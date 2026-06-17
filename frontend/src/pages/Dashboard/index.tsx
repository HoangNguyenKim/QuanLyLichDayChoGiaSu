// React import removed
import { motion } from 'framer-motion';
import { 
  useDashboardToday, 
  useDashboardUpcoming, 
  useIncomeStats
} from '@/hooks/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, BookOpen, MapPin, Flame, Briefcase } from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div variants={itemVariants}>
            <Card className="bg-primary/10 border-none shadow-soft rounded-3xl overflow-hidden relative">
              <div className="absolute -right-6 -top-6 text-primary/20 pointer-events-none">
                <BookOpen size={100} />
              </div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                  <div className="p-2 bg-primary/20 rounded-2xl">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  Hôm nay
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black text-foreground">
                  {isLoadingToday ? '...' : todayData?.total || 0} ca
                </div>
                <p className="text-sm font-medium text-muted-foreground mt-1">
                  Đã xong: {todayData?.completed || 0} / {todayData?.total || 0}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-secondary/20 border-none shadow-soft rounded-3xl overflow-hidden relative">
              <div className="absolute -right-6 -top-6 text-secondary/40 pointer-events-none">
                <Flame size={100} />
              </div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-lg font-bold text-yellow-600 flex items-center gap-2">
                  <div className="p-2 bg-yellow-500/20 rounded-2xl">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  Tuần này
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black text-foreground">
                  {formatCurrency(incomeStats?.weekly?.estimated || 0)}
                </div>
                <p className="text-sm font-medium text-muted-foreground mt-1">
                  Thực nhận: <span className="text-foreground">{formatCurrency(incomeStats?.weekly?.actual || 0)}</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-accent/10 border-none shadow-soft rounded-3xl overflow-hidden relative">
              <div className="absolute -right-6 -top-6 text-accent/20 pointer-events-none">
                <Briefcase size={100} />
              </div>
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-lg font-bold text-accent flex items-center gap-2">
                  <div className="p-2 bg-accent/20 rounded-2xl">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                  Tháng này
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-black text-foreground">
                  {formatCurrency(incomeStats?.monthly?.estimated || 0)}
                </div>
                <p className="text-sm font-medium text-muted-foreground mt-1">
                  Thực nhận: <span className="text-foreground">{formatCurrency(incomeStats?.monthly?.actual || 0)}</span>
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  Tổng thu nhập lũy kế: {formatCurrency(incomeStats?.total?.actual || 0)}
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
                <Card key={schedule.id} className="border-none shadow-soft rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300">
                  <CardContent className="p-0 flex flex-col sm:flex-row bg-background">
                    <div className="bg-primary/5 sm:w-32 flex flex-row sm:flex-col items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-primary/10">
                      <div className="text-sm font-bold text-primary uppercase">
                        {schedule.date ? format(parseISO(schedule.date), 'EEEE', { locale: vi }) : 'N/A'}
                      </div>
                      <div className="text-2xl font-black text-foreground">
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
    </div>
  );
}
