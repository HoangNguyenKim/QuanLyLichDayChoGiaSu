import { useState } from 'react';
import { useStudents, useSubjects, useCreateStudent, useCreateSubject, useUpdateStudent, useDeleteStudent, useMarkPaid } from '@/hooks/queries';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Ghost, Plus, MapPin, Phone, StickyNote, Baby, Building2, Loader2, Pencil, Trash2, Banknote } from 'lucide-react';
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
  tuitionFeePerSession: z.coerce.number().min(0, 'Giá tiền không được âm').optional(),
  subjectIds: z.array(z.number()).optional(),
});

type CreateStudentFormValues = z.infer<typeof createStudentSchema>;

const StudentsPage = () => {
  const { data: response, isLoading, error } = useStudents();
  const students = response?.data || [];
  const { data: subjectsResponse } = useSubjects();
  const subjects = subjectsResponse?.data || [];
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const markPaid = useMarkPaid();
  const createSubject = useCreateSubject();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [newSubjectName, setNewSubjectName] = useState('');

  const form = useForm<CreateStudentFormValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      fullName: '',
      address: '',
      apartmentFloor: '',
      parentPhone: '',
      note: '',
      tuitionFeePerSession: 0,
      subjectIds: [],
    },
  });

  const handleEditClick = (student: any) => {
    setSelectedStudent(student);
    form.reset({
      fullName: student.fullName,
      address: student.address || '',
      apartmentFloor: student.apartmentFloor || '',
      parentPhone: student.parentPhone || '',
      note: student.note || '',
      tuitionFeePerSession: student.tuitionFeePerSession || 0,
      subjectIds: student.subjects?.map((s: any) => s.subjectId) || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (student: any) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedStudent) return;
    deleteStudent.mutate(selectedStudent.id, {
      onSuccess: () => {
        toast.success('Xóa học sinh thành công!');
        setIsDeleteDialogOpen(false);
      },
      onError: () => toast.error('Lỗi khi xóa học sinh'),
    });
  };

  const handleMarkPaid = (studentId: number) => {
    markPaid.mutate(studentId, {
      onSuccess: (res: any) => toast.success(res.data?.message || 'Thu tiền thành công!'),
      onError: () => toast.error('Lỗi khi thu tiền'),
    });
  };

  const onSubmit = (data: CreateStudentFormValues) => {
    if (isEditDialogOpen && selectedStudent) {
      updateStudent.mutate({ id: selectedStudent.id, data }, {
        onSuccess: () => {
          toast.success('Cập nhật thành công!');
          setIsEditDialogOpen(false);
          form.reset();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra.'),
      });
    } else {
      createStudent.mutate(data, {
        onSuccess: () => {
          toast.success('Thêm học sinh thành công!');
          setIsAddDialogOpen(false);
          form.reset();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra.'),
      });
    }
  };

  const handleAddSubject = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    createSubject.mutate({ name: newSubjectName }, {
      onSuccess: () => {
        setNewSubjectName('');
        toast.success('Thêm môn học thành công');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Lỗi thêm môn học');
      }
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
                      <div className="mb-2">
                        <FormLabel className="text-base">Môn học</FormLabel>
                      </div>
                      
                      {subjects.length === 0 ? (
                        <div className="text-sm text-muted-foreground mb-2 italic">
                          Chưa có môn học nào. Hãy thêm môn học trước.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 mb-4">
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
                      )}

                      <div className="flex gap-2 items-center">
                        <Input 
                          placeholder="Nhập tên môn mới (VD: Toán 12)" 
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubject(e as any);
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={handleAddSubject}
                          disabled={!newSubjectName.trim() || createSubject.isPending}
                        >
                          {createSubject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Thêm môn"}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tuitionFeePerSession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Học phí 1 buổi (VNĐ)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="200000" {...field} />
                      </FormControl>
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
          {students.map((student) => {
            const unpaidSchedules = student.schedules?.length || 0;
            const totalDebt = unpaidSchedules * (student.tuitionFeePerSession || 0);

            return (
            <Card key={student.id} className="rounded-3xl shadow-soft border-primary/20 hover:shadow-md hover:border-primary/40 transition-all duration-300 bg-card overflow-hidden group flex flex-col">
              <CardHeader className="bg-secondary/20 pb-4 border-b border-primary/10 group-hover:bg-secondary/30 transition-colors">
                <CardTitle className="flex items-center justify-between text-lg text-primary-foreground">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2.5 rounded-2xl group-hover:bg-primary/30 transition-colors">
                      <Baby className="w-5 h-5 text-primary" />
                    </div>
                    <span className="truncate max-w-[180px]">{student.fullName}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(student)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(student)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-3.5 flex-1">
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
              <CardFooter className="bg-slate-50 border-t p-4 flex flex-col gap-3">
                <div className="w-full flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Banknote className="w-4 h-4" />
                    <span>Học phí:</span>
                  </div>
                  <span className="font-semibold">{student.tuitionFeePerSession ? student.tuitionFeePerSession.toLocaleString() + ' đ/buổi' : 'Chưa nhập'}</span>
                </div>
                <div className="w-full flex justify-between items-center text-sm">
                  <span className="text-slate-600">Chưa thu tiền:</span>
                  <span className="font-medium text-amber-600">{unpaidSchedules} buổi</span>
                </div>
                <div className="w-full flex justify-between items-center">
                  <span className="text-sm text-slate-600">Tổng nợ:</span>
                  <span className="font-bold text-lg text-rose-600">{totalDebt.toLocaleString()} đ</span>
                </div>
                {unpaidSchedules > 0 && (
                  <Button 
                    onClick={() => handleMarkPaid(student.id)}
                    className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-sm"
                    disabled={markPaid.isPending}
                  >
                    Đã lấy tiền học
                  </Button>
                )}
              </CardFooter>
            </Card>
          )})}
        </div>
      )}

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-3xl border-primary/20 max-w-md w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-primary-foreground">Sửa thông tin học sinh ✏️</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            {/* Same form content but we use a ref or copy it. To keep it simple, we just render the form again or extract it.
                Since extracting takes a lot of changes, we can just duplicate the form content here for now. */}
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
                name="tuitionFeePerSession"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Học phí 1 buổi (VNĐ)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="200000" {...field} />
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
                    <div className="mb-2">
                      <FormLabel className="text-base">Môn học</FormLabel>
                    </div>
                    {subjects.length === 0 ? (
                      <div className="text-sm text-muted-foreground mb-2 italic">
                        Chưa có môn học nào.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {subjects.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="subjectIds"
                            render={({ field }) => (
                              <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item.id])
                                        : field.onChange(field.value?.filter((val) => val !== item.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer text-sm">{item.name}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    )}
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
              <Button type="submit" className="w-full rounded-2xl mt-4" disabled={updateStudent.isPending}>
                {updateStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-3xl border-red-200 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-xl text-center">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-slate-600">
            Bạn có chắc chắn muốn xóa học sinh <span className="font-bold">{selectedStudent?.fullName}</span> không? Tất cả lịch học của học sinh này cũng sẽ bị xóa.
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" className="flex-1 rounded-xl" onClick={confirmDelete} disabled={deleteStudent.isPending}>
              {deleteStudent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa học sinh
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default StudentsPage;
