import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const createStudentSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  grade: z.string().optional(),
  address: z.string().optional(),
  apartmentFloor: z.string().optional(),
  parentPhone: z.string().optional(),
  note: z.string().optional(),
  tuitionFeePerSession: z.coerce.number().min(0, 'Giá tiền không được âm').optional(),
  previousUnpaidSessions: z.coerce.number().min(0, 'Số buổi không được âm').optional(),
  subjectIds: z.array(z.number()).optional(),
});

export type CreateStudentFormValues = z.infer<typeof createStudentSchema>;

interface StudentFormProps {
  defaultValues?: Partial<CreateStudentFormValues>;
  onSubmit: (data: CreateStudentFormValues) => void;
  isLoading: boolean;
  submitText: string;
  subjects: any[];
  onAddSubject: (name: string) => void;
  isAddingSubject: boolean;
}

export const StudentForm = ({
  defaultValues,
  onSubmit,
  isLoading,
  submitText,
  subjects,
  onAddSubject,
  isAddingSubject
}: StudentFormProps) => {
  const [newSubjectName, setNewSubjectName] = useState('');

  const form = useForm<CreateStudentFormValues>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      fullName: defaultValues?.fullName || '',
      grade: defaultValues?.grade || '',
      address: defaultValues?.address || '',
      apartmentFloor: defaultValues?.apartmentFloor || '',
      parentPhone: defaultValues?.parentPhone || '',
      note: defaultValues?.note || '',
      tuitionFeePerSession: defaultValues?.tuitionFeePerSession || 0,
      previousUnpaidSessions: defaultValues?.previousUnpaidSessions || 0,
      subjectIds: defaultValues?.subjectIds || [],
    },
  });

  const handleAddSubjectClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    onAddSubject(newSubjectName);
    setNewSubjectName('');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
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
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lớp</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lớp..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i+1} value={`Lớp ${i+1}`}>Lớp {i+1}</SelectItem>
                    ))}
                    <SelectItem value="Đại học">Đại học</SelectItem>
                    <SelectItem value="Người đi làm">Người đi làm</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
                      handleAddSubjectClick(e as any);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleAddSubjectClick}
                  disabled={!newSubjectName.trim() || isAddingSubject}
                >
                  {isAddingSubject ? <Loader2 className="w-4 h-4 animate-spin" /> : "Thêm môn"}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tuitionFeePerSession"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Học phí 1 buổi (VNĐ)</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="200.000" 
                    value={field.value ? Number(field.value).toLocaleString('vi-VN') : ''}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, '');
                      field.onChange(rawValue ? Number(rawValue) : 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="previousUnpaidSessions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số buổi nợ cũ (nếu có)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
        <Button type="submit" className="w-full rounded-2xl mt-4" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitText}
        </Button>
      </form>
    </Form>
  );
};
