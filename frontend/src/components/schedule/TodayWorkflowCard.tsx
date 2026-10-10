import { useState } from 'react';
import { useDashboardToday, useToggleCompleted, useToggleLessonPrepared } from '@/hooks/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, CheckCircle, Circle, Building, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function TodayWorkflowCard() {
  const { data: todayResp, isLoading } = useDashboardToday();
  const toggleCompleted = useToggleCompleted();
  const togglePrepared = useToggleLessonPrepared();
  
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean, scheduleId: number | null }>({ open: false, scheduleId: null });
  const [extraHours, setExtraHours] = useState<number>(0);

  const schedules = todayResp?.data?.schedules || [];

  if (isLoading) return <div>Đang tải lịch hôm nay...</div>;

  const handleCompleteConfirm = () => {
    if (confirmDialog.scheduleId) {
      toggleCompleted.mutate({ id: confirmDialog.scheduleId, extraHours }, {
        onSuccess: () => {
          toast.success('Ca dạy hoàn thành!');
          setConfirmDialog({ open: false, scheduleId: null });
        },
        onError: () => toast.error('Có lỗi xảy ra')
      });
    }
  };

  return (
    <>
      <Card className="bg-card shadow-md-pink hover:shadow-lg transition-shadow duration-300 border-2 border-primary/30 rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary/10 border-b border-primary/20 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            Hôm nay <span className="text-sm font-semibold text-primary">({schedules.length} ca)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {schedules.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground font-medium">Bạn không có ca dạy nào hôm nay. 🎉</div>
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
                          {s.extraHours > 0 && (
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                              +{s.extraHours}h
                            </span>
                          )}
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
                            if (s.completed) {
                              toggleCompleted.mutate({ id: s.id }, {
                                onSuccess: () => toast.success('Đã bỏ đánh dấu hoàn thành')
                              });
                            } else {
                              setExtraHours(0);
                              setConfirmDialog({ open: true, scheduleId: s.id });
                            }
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

      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, scheduleId: null })}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Xác nhận hoàn thành</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-center text-muted-foreground">Ca dạy này đã kết thúc, bạn có dạy thêm giờ không?</p>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map((h) => (
                <button
                  key={h}
                  onClick={() => setExtraHours(h)}
                  className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                    extraHours === h 
                      ? 'bg-primary text-primary-foreground border-primary scale-105' 
                      : 'bg-transparent text-foreground hover:bg-secondary border-border'
                  }`}
                >
                  {h === 0 ? 'Không' : `+${h}h`}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" className="w-full rounded-xl" onClick={() => setConfirmDialog({ open: false, scheduleId: null })}>Huỷ</Button>
            <Button className="w-full rounded-xl" onClick={handleCompleteConfirm} disabled={toggleCompleted.isPending}>
              {toggleCompleted.isPending ? 'Đang lưu...' : 'Hoàn thành'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
