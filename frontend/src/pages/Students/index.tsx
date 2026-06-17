import { useState } from 'react';
import { useStudents, useSubjects, useCreateStudent } from '@/hooks/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Ghost, Plus, MapPin, Phone, StickyNote, Baby, Building2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const createStudentSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  address: z.string().optional(),
  apartmentFloor: z.string().optional(),
  parentPhone: z.string().optional(),
  note: z.string().optional(),
  subjectIds: z.array(z.number()).optional(),
});

type CreateStudentFormValues = z.infer<typeof createStudentSchema>;

const StudentsPage = () => {
  const { data: response, isLoading, error } = useStudents();
  const students = response?.data || [];
  const { data: subjectsResponse } = useSubjects();
  const subjects = subjectsResponse?.data || [];
  const createStudent = useCreateStudent();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const form = useForm<CreateStudentFormValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      fullName: '',
      address: '',
      apartmentFloor: '',
      parentPhone: '',
      note: '',
      subjectIds: [],
    },
  });

  const onSubmit = (data: CreateStudentFormValues) => {
    createStudent.mutate(data, {
      onSuccess: () => {
        toast.success('Thêm học sinh thành công!');
        setIsAddDialogOpen(false);
        form.reset();
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi thêm học sinh.');
      },
    });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-foreground">Danh sách học sinh</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl shadow-soft">
              <Plus className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">Thêm học sinh</span>
              <span className="sm:hidden">Thêm</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl border-primary/20 max-w-md w-[90vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center text-xl text-primary-foreground">Thêm học sinh mới 🧸</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ và tên *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input placeholder="Số nhà, đường, phường..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="apartmentFloor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tầng/Căn hộ</FormLabel>
                        <FormControl>
                          <Input placeholder="Tầng 5, P502..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SĐT Phụ huynh</FormLabel>
                        <FormControl>
                          <Input placeholder="0987..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="subjectIds"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Môn học</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {subjects.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="subjectIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer text-sm">
                                    {item.name}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Input placeholder="Thông tin thêm..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full rounded-2xl mt-4" disabled={createStudent.isPending}>
                  {createStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu học sinh
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-destructive bg-destructive/10 rounded-2xl">
          <p>Có lỗi xảy ra khi tải danh sách học sinh.</p>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white/50 rounded-3xl border border-dashed border-primary/30">
          <Ghost className="w-24 h-24 text-primary/40 animate-pulse" />
          <h3 className="text-xl font-medium text-primary-foreground">Chưa có học sinh nào!</h3>
          <p className="text-sm text-muted-foreground">Hãy thêm học sinh đầu tiên nhé 🌟</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <Card key={student.id} className="rounded-3xl shadow-soft border-primary/20 hover:shadow-md hover:border-primary/40 transition-all duration-300 bg-card overflow-hidden group">
              <CardHeader className="bg-secondary/20 pb-4 border-b border-primary/10 group-hover:bg-secondary/30 transition-colors">
                <CardTitle className="flex items-center gap-3 text-lg text-primary-foreground">
                  <div className="bg-primary/20 p-2.5 rounded-2xl group-hover:bg-primary/30 transition-colors">
                    <Baby className="w-5 h-5 text-primary" />
                  </div>
                  <span className="truncate">{student.fullName}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-3.5">
                {student.address && (
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="bg-accent/20 p-1.5 rounded-lg shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-accent-foreground" />
                    </div>
                    <span className="leading-relaxed">{student.address}</span>
                  </div>
                )}
                {student.apartmentFloor && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="bg-accent/20 p-1.5 rounded-lg shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-accent-foreground" />
                    </div>
                    <span>Tầng/Phòng: {student.apartmentFloor}</span>
                  </div>
                )}
                {student.parentPhone && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="bg-accent/20 p-1.5 rounded-lg shrink-0">
                      <Phone className="w-3.5 h-3.5 text-accent-foreground" />
                    </div>
                    <span>{student.parentPhone}</span>
                  </div>
                )}
                {student.note && (
                  <div className="flex items-start gap-3 text-sm text-muted-foreground bg-secondary/10 p-3.5 rounded-2xl mt-4 border border-secondary/20">
                    <StickyNote className="w-4 h-4 mt-0.5 text-secondary-foreground shrink-0" />
                    <span className="italic leading-relaxed">{student.note}</span>
                  </div>
                )}
                
                {(!student.address && !student.apartmentFloor && !student.parentPhone && !student.note) && (
                  <div className="text-sm text-muted-foreground/50 italic py-4 text-center">
                    Chưa có thông tin bổ sung
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsPage;
