import { useDashboardToday, useToggleCompleted, useToggleLessonPrepared } from '@/hooks/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle, Circle, Building, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function TodayWorkflowCard() {
  const { data: todayResp, isLoading } = useDashboardToday();
  const toggleCompleted = useToggleCompleted();
  const togglePrepared = useToggleLessonPrepared();

  const schedules = todayResp?.data?.schedules || [];

  if (isLoading) return <div>Đang tải lịch hôm nay...</div>;

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          Hôm nay <span className="text-sm font-normal text-muted-foreground">({schedules.length} ca)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {schedules.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Bạn không có ca dạy nào hôm nay.</div>
        ) : (
          <div className="divide-y divide-border">
            {schedules.map((s: any) => {
              const isApartment = s.location?.toLowerCase().includes('chung cư') || s.student?.apartmentFloor;
              
              return (
                <div key={s.id} className={`p-4 transition-colors ${s.completed ? 'bg-muted/30 opacity-70' : 'hover:bg-accent/5'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{s.startTime} - {s.endTime}</span>
                        <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {s.subject?.name || 'Môn học'}
                        </span>
                        {s.mode === 'ONLINE' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Online</span>}
                      </div>
                      <h3 className="font-bold text-foreground text-md">{s.student?.fullName || 'Học sinh'}</h3>
                      
                      {/* Location Display */}
                      {s.mode === 'OFFLINE' && (
                        <div className="mt-2 text-sm text-muted-foreground bg-secondary/20 p-2 rounded-lg border border-border/50">
                          {isApartment ? (
                            <div className="space-y-1">
                              <div className="flex items-start gap-1">
                                <Building className="w-4 h-4 mt-0.5 text-accent" /> 
                                <span className="font-semibold text-foreground">Chung cư:</span> {s.location || s.student?.address}
                              </div>
                              {s.student?.apartmentFloor && (
                                <div className="ml-5 text-xs"><span className="font-medium text-foreground">Tầng:</span> {s.student?.apartmentFloor}</div>
                              )}
                              {s.locationDetail && (
                                <div className="ml-5 text-xs"><span className="font-medium text-foreground">Block/Note:</span> {s.locationDetail}</div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-start gap-1">
                              <MapPin className="w-4 h-4 mt-0.5 text-secondary-foreground" /> 
                              <span>{s.location || s.student?.address || 'Chưa có địa chỉ'}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Todo / Prepared Status */}
                      <div className="mt-3 flex items-center gap-2">
                        <button 
                          onClick={() => {
                            togglePrepared.mutate(s.id, {
                              onSuccess: () => toast.success(s.lessonPrepared ? 'Đã bỏ đánh dấu soạn bài' : 'Đã đánh dấu soạn bài xong')
                            });
                          }}
                          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                            s.lessonPrepared 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          {s.lessonPrepared ? 'Đã soạn bài' : 'Chưa soạn bài'}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <button 
                        onClick={() => {
                          toggleCompleted.mutate(s.id, {
                            onSuccess: () => toast.success(s.completed ? 'Đã bỏ đánh dấu hoàn thành' : 'Ca dạy hoàn thành!')
                          });
                        }}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                          s.completed 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary'
                        }`}
                        title={s.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'}
                      >
                        {s.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
