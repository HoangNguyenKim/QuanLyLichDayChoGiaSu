import { PrismaClient, ScheduleMode } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.reminder.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.studentSubject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.subject.deleteMany();

  // Create 5 subjects
  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: 'Toán' } }),
    prisma.subject.create({ data: { name: 'Lý' } }),
    prisma.subject.create({ data: { name: 'Hóa' } }),
    prisma.subject.create({ data: { name: 'Anh Văn' } }),
    prisma.subject.create({ data: { name: 'Tin Học' } }),
  ]);

  // Create 5 students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        fullName: 'Nguyễn Văn An',
        address: '123 Nguyễn Huệ, Quận 1',
        apartmentFloor: 'Tầng 3',
        parentPhone: '0901234567',
        note: 'Học sinh giỏi, cần nâng cao',
      },
    }),
    prisma.student.create({
      data: {
        fullName: 'Trần Thị Bình',
        address: '456 Lê Lợi, Quận 3',
        apartmentFloor: 'Tầng 5',
        parentPhone: '0912345678',
        note: 'Cần bổ trợ thêm bài tập',
      },
    }),
    prisma.student.create({
      data: {
        fullName: 'Lê Hoàng Cường',
        address: '789 Trần Hưng Đạo, Quận 5',
        parentPhone: '0923456789',
        note: 'Chuẩn bị thi đại học',
      },
    }),
    prisma.student.create({
      data: {
        fullName: 'Phạm Minh Dũng',
        address: '321 Hai Bà Trưng, Quận 1',
        apartmentFloor: 'Tầng 2',
        parentPhone: '0934567890',
      },
    }),
    prisma.student.create({
      data: {
        fullName: 'Hoàng Thị Lan',
        address: '654 Võ Văn Tần, Quận 3',
        parentPhone: '0945678901',
        note: 'Học online vào cuối tuần',
      },
    }),
  ]);

  // Assign subjects to students
  await Promise.all([
    prisma.studentSubject.create({ data: { studentId: students[0].id, subjectId: subjects[0].id } }),
    prisma.studentSubject.create({ data: { studentId: students[0].id, subjectId: subjects[1].id } }),
    prisma.studentSubject.create({ data: { studentId: students[1].id, subjectId: subjects[0].id } }),
    prisma.studentSubject.create({ data: { studentId: students[1].id, subjectId: subjects[3].id } }),
    prisma.studentSubject.create({ data: { studentId: students[2].id, subjectId: subjects[0].id } }),
    prisma.studentSubject.create({ data: { studentId: students[2].id, subjectId: subjects[1].id } }),
    prisma.studentSubject.create({ data: { studentId: students[2].id, subjectId: subjects[2].id } }),
    prisma.studentSubject.create({ data: { studentId: students[3].id, subjectId: subjects[3].id } }),
    prisma.studentSubject.create({ data: { studentId: students[3].id, subjectId: subjects[4].id } }),
    prisma.studentSubject.create({ data: { studentId: students[4].id, subjectId: subjects[0].id } }),
    prisma.studentSubject.create({ data: { studentId: students[4].id, subjectId: subjects[4].id } }),
  ]);

  // Create schedules for current week
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

  const scheduleData = [];

  // Monday
  const mon = new Date(monday);
  scheduleData.push(
    {
      studentId: students[0].id,
      subjectId: subjects[0].id,
      date: new Date(mon),
      startTime: '08:00',
      endTime: '10:00',
      location: '123 Nguyễn Huệ',
      mode: ScheduleMode.OFFLINE,
      estimatedIncome: 300000,
      actualIncome: 300000,
      completed: true,
      lessonPrepared: true,
      teachingNote: 'Ôn lại chương 3, làm bài tập trang 45',
    },
    {
      studentId: students[1].id,
      subjectId: subjects[0].id,
      date: new Date(mon),
      startTime: '14:00',
      endTime: '16:00',
      location: '456 Lê Lợi',
      mode: ScheduleMode.OFFLINE,
      estimatedIncome: 250000,
      actualIncome: 250000,
      completed: true,
      lessonPrepared: true,
    },
  );

  // Tuesday
  const tue = new Date(monday);
  tue.setDate(monday.getDate() + 1);
  scheduleData.push(
    {
      studentId: students[2].id,
      subjectId: subjects[1].id,
      date: new Date(tue),
      startTime: '09:00',
      endTime: '11:00',
      mode: ScheduleMode.ONLINE,
      estimatedIncome: 350000,
      actualIncome: 350000,
      completed: true,
      lessonPrepared: true,
      teachingNote: 'Bài tập điện từ học',
    },
    {
      studentId: students[3].id,
      subjectId: subjects[3].id,
      date: new Date(tue),
      startTime: '15:00',
      endTime: '17:00',
      location: '321 Hai Bà Trưng',
      mode: ScheduleMode.OFFLINE,
      estimatedIncome: 200000,
      lessonPrepared: true,
    },
  );

  // Wednesday
  const wed = new Date(monday);
  wed.setDate(monday.getDate() + 2);
  scheduleData.push(
    {
      studentId: students[0].id,
      subjectId: subjects[1].id,
      date: new Date(wed),
      startTime: '08:00',
      endTime: '10:00',
      location: '123 Nguyễn Huệ',
      mode: ScheduleMode.OFFLINE,
      estimatedIncome: 300000,
      lessonPrepared: false,
    },
    {
      studentId: students[4].id,
      subjectId: subjects[0].id,
      date: new Date(wed),
      startTime: '18:00',
      endTime: '20:00',
      mode: ScheduleMode.ONLINE,
      estimatedIncome: 280000,
      lessonPrepared: false,
    },
  );

  // Thursday
  const thu = new Date(monday);
  thu.setDate(monday.getDate() + 3);
  scheduleData.push(
    {
      studentId: students[1].id,
      subjectId: subjects[3].id,
      date: new Date(thu),
      startTime: '10:00',
      endTime: '12:00',
      mode: ScheduleMode.ONLINE,
      estimatedIncome: 250000,
    },
    {
      studentId: students[2].id,
      subjectId: subjects[0].id,
      date: new Date(thu),
      startTime: '14:00',
      endTime: '16:00',
      location: '789 Trần Hưng Đạo',
      mode: ScheduleMode.OFFLINE,
      estimatedIncome: 350000,
    },
  );

  // Friday
  const fri = new Date(monday);
  fri.setDate(monday.getDate() + 4);
  scheduleData.push(
    {
      studentId: students[3].id,
      subjectId: subjects[4].id,
      date: new Date(fri),
      startTime: '09:00',
      endTime: '11:00',
      mode: ScheduleMode.ONLINE,
      estimatedIncome: 200000,
    },
    {
      studentId: students[4].id,
      subjectId: subjects[4].id,
      date: new Date(fri),
      startTime: '16:00',
      endTime: '18:00',
      location: '654 Võ Văn Tần',
      mode: ScheduleMode.OFFLINE,
      estimatedIncome: 280000,
    },
  );

  // Saturday
  const sat = new Date(monday);
  sat.setDate(monday.getDate() + 5);
  scheduleData.push({
    studentId: students[0].id,
    subjectId: subjects[0].id,
    date: new Date(sat),
    startTime: '08:00',
    endTime: '10:00',
    mode: ScheduleMode.ONLINE,
    estimatedIncome: 300000,
  });

  const schedules = await Promise.all(
    scheduleData.map((s) => prisma.schedule.create({ data: s })),
  );

  // Create reminders
  await Promise.all([
    prisma.reminder.create({
      data: { scheduleId: schedules[2].id, remindBeforeMinutes: 30, enabled: true },
    }),
    prisma.reminder.create({
      data: { scheduleId: schedules[3].id, remindBeforeMinutes: 60, enabled: true },
    }),
    prisma.reminder.create({
      data: { scheduleId: schedules[4].id, remindBeforeMinutes: 15, enabled: true },
    }),
    prisma.reminder.create({
      data: { scheduleId: schedules[6].id, remindBeforeMinutes: 30, enabled: false },
    }),
  ]);

  console.log('✅ Seed data created successfully!');
  console.log(`  - ${subjects.length} subjects`);
  console.log(`  - ${students.length} students`);
  console.log(`  - ${scheduleData.length} schedules`);
  console.log(`  - 4 reminders`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
