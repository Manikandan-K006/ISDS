const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = require('./prisma');

const studentSeed = [
  { name: 'Arjun Sharma', email: 'arjun@school.com', password: 'password123', role: 'student', class: '10A', rollNumber: '1012', parentContact: '+91 98765 43210' },
  { name: 'Priya Patel', email: 'priya@school.com', password: 'password123', role: 'student', class: '10A', rollNumber: '1015', parentContact: '+91 98765 43211' },
  { name: 'Rahul Singh', email: 'rahul@school.com', password: 'password123', role: 'student', class: '10B', rollNumber: '1020', parentContact: '+91 98765 43212' },
  { name: 'Ananya Gupta', email: 'ananya@school.com', password: 'password123', role: 'student', class: '9A', rollNumber: '901', parentContact: '+91 98765 43213' },
];

const courseSeed = [
  { title: 'Advanced Mathematics', domain: 'Mandatory', type: 'mandatory', creditPoints: 4, instructor: 'Dr. Verma', duration: '12 weeks', difficulty: 'advanced', modules: [{ title: 'Module 1: Algebra', lessons: [{ title: 'Introduction to Algebra', videoUrl: 'https://youtu.be/NybHckSEQBI' }, { title: 'Linear Equations', videoUrl: 'https://youtu.be/Ft2_QtXAnh8' }, { title: 'Quadratic Equations', videoUrl: 'https://youtu.be/1F1LQh1_sNc' }] }, { title: 'Module 2: Calculus', lessons: [{ title: 'Limits & Continuity', videoUrl: 'https://youtu.be/9I7TVGvnIDg' }, { title: 'Derivatives', videoUrl: 'https://youtu.be/PIWAkMpGZTs' }, { title: 'Integration', videoUrl: 'https://youtu.be/JWlKfQ3MBXU' }] }] },
  { title: 'Quantum Physics', domain: 'Science', type: 'elective', creditPoints: 0, instructor: 'Prof. Kumar', duration: '10 weeks', difficulty: 'advanced', modules: [{ title: 'Module 1: Basics', lessons: [{ title: 'Introduction to Quantum', videoUrl: 'https://youtu.be/JzIYSr3k5_s' }, { title: 'Wave-Particle Duality', videoUrl: 'https://youtu.be/Q_h4IoPJXZw' }] }] },
  { title: 'English Literature', domain: 'Humanities', type: 'elective', creditPoints: 0, instructor: 'Ms. Singh', duration: '8 weeks', difficulty: 'intermediate', modules: [{ title: 'Module 1: Poetry', lessons: [{ title: 'Romantic Poetry', videoUrl: '' }, { title: 'Modern Poetry', videoUrl: '' }] }] },
  { title: 'Basketball Fundamentals', domain: 'Physical Education', type: 'elective', creditPoints: 0, instructor: 'Coach Ravi', duration: '6 weeks', difficulty: 'beginner', modules: [] },
  { title: 'Environmental Science', domain: 'Science', type: 'mandatory', creditPoints: 3, instructor: 'Dr. Gupta', duration: '10 weeks', difficulty: 'intermediate', modules: [{ title: 'Module 1: Ecosystems', lessons: [{ title: 'Introduction', videoUrl: '' }, { title: 'Ecosystem Types', videoUrl: '' }] }] },
  { title: 'Debate & Communication', domain: 'Co-curricular', type: 'elective', creditPoints: 0, instructor: 'Ms. Patel', duration: '6 weeks', difficulty: 'intermediate', modules: [] },
  { title: 'Computer Science Fundamentals', domain: 'Engineering', type: 'mandatory', creditPoints: 4, instructor: 'Mr. Raj', duration: '12 weeks', difficulty: 'intermediate', modules: [] },
  { title: 'Music Theory 101', domain: 'Music', type: 'elective', creditPoints: 0, instructor: 'Mr. Taylor', duration: '8 weeks', difficulty: 'beginner', modules: [] },
];

const teacherSeed = [
  { name: 'Dr. Verma', email: 'verma@school.com', subject: 'Mathematics', employeeId: 'T-101' },
  { name: 'Prof. Kumar', email: 'kumar@school.com', subject: 'Physics', employeeId: 'T-102' },
  { name: 'Ms. Singh', email: 'singh@school.com', subject: 'English', employeeId: 'T-103' },
  { name: 'Coach Ravi', email: 'ravi@school.com', subject: 'Physical Education', employeeId: 'T-104' },
  { name: 'Dr. Gupta', email: 'gupta@school.com', subject: 'Environmental Science', employeeId: 'T-105' },
  { name: 'Ms. Patel', email: 'patel@school.com', subject: 'Communication', employeeId: 'T-106' },
  { name: 'Mr. Raj', email: 'raj@school.com', subject: 'Computer Science', employeeId: 'T-107' },
  { name: 'Mr. Taylor', email: 'taylor@school.com', subject: 'Music', employeeId: 'T-108' },
];

const achievementSeed = [
  { name: 'First Course Complete', description: 'Completed your first course!', icon: 'trophy', type: 'course_completion', points: 50 },
  { name: 'Perfect Attendance - April', description: '100% attendance in April 2026', icon: 'star', type: 'attendance_perfect', points: 30 },
  { name: 'Top 3 in Class', description: 'Ranked in the top 3 of the class mid-term exams', icon: 'medal', type: 'leaderboard_top', points: 100 },
  { name: '5 Certificates Earned', description: 'Completed 5 courses', icon: 'award', type: 'course_completion', points: 200 },
];

async function clearAll() {
  const order = [
    prisma.certificateVerification.deleteMany({}),
    prisma.certificate.deleteMany({}),
    prisma.assignmentSubmission.deleteMany({}),
    prisma.assignment.deleteMany({}),
    prisma.attendance.deleteMany({}),
    prisma.quizResponse.deleteMany({}),
    prisma.quizResult.deleteMany({}),
    prisma.enrollment.deleteMany({}),
    prisma.lessonProgress.deleteMany({}),
    prisma.calendarEvent.deleteMany({}),
    prisma.announcement.deleteMany({}),
    prisma.message.deleteMany({}),
    prisma.notification.deleteMany({}),
    prisma.refreshToken.deleteMany({}),
    prisma.userSettings.deleteMany({}),
    prisma.userAchievement.deleteMany({}),
    prisma.userSkill.deleteMany({}),
    prisma.activityLog.deleteMany({}),
    prisma.aIStudyPlan.deleteMany({}),
    prisma.aIInsight.deleteMany({}),
    prisma.course.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.skill.deleteMany({}),
    prisma.achievement.deleteMany({}),
    prisma.department.deleteMany({}),
  ];
  await Promise.all(order);
  console.log('Cleared existing data');
}

async function seed() {
  try {
    await clearAll();

    const hash = (pw) => bcrypt.hashSync(pw, 12);

    // Users
    await prisma.user.create({ data: { name: 'Admin User', email: 'admin@school.com', password: hash('password123'), role: 'admin', isVerified: true } });

    const teacherMap = {};
    for (const t of teacherSeed) {
      teacherMap[t.name] = await prisma.user.create({ data: { name: t.name, email: t.email, password: hash('password123'), role: 'teacher', subject: t.subject, employeeId: t.employeeId, isVerified: true } });
    }

    const students = [];
    for (const s of studentSeed) {
      const u = await prisma.user.create({ data: { name: s.name, email: s.email, password: hash(s.password), role: 'student', class: s.class, rollNumber: s.rollNumber, phone: s.parentContact, isVerified: true } });
      students.push(u);
    }
    console.log(`Created ${1 + teacherSeed.length + students.length} users`);

    // Parent accounts linked to students
    const parentDefs = [
      { name: 'Parent of Arjun', email: 'parent-arjun@school.com', student: 'arjun@school.com' },
      { name: 'Parent of Priya', email: 'parent-priya@school.com', student: 'priya@school.com' },
      { name: 'Parent of Ananya', email: 'parent-ananya@school.com', student: 'ananya@school.com' },
    ];
    for (const p of parentDefs) {
      const student = students.find((s) => s.email === p.student);
      await prisma.user.create({ data: { name: p.name, email: p.email, password: hash('password123'), role: 'parent', isVerified: true, studentIds: JSON.stringify([student.id]) } });
    }

    const studentArjun = students.find((s) => s.email === 'arjun@school.com');
    const studentPriya = students.find((s) => s.email === 'priya@school.com');
    const studentAnanya = students.find((s) => s.email === 'ananya@school.com');

    // Courses
    const createdCourses = [];
    for (const c of courseSeed) {
      const instructor = teacherMap[c.instructor];
      const course = await prisma.course.create({
        data: {
          title: c.title,
          description: `${c.domain} - ${c.duration}`,
          instructorId: instructor.id,
          difficulty: c.difficulty,
          duration: c.duration,
          credits: c.creditPoints,
          status: 'published',
          isPublished: true,
          tags: JSON.stringify([c.type, c.domain]),
          modules: {
            create: c.modules.map((m, mi) => ({
              title: m.title,
              order: mi,
              isPublished: true,
              lessons: {
                create: m.lessons.map((l, li) => ({
                  title: l.title,
                  videoUrl: l.videoUrl || null,
                  content: '',
                  order: li,
                  isPublished: true,
                })),
              },
            })),
          },
        },
      });
      createdCourses.push(course);
    }
    console.log(`Created ${createdCourses.length} courses`);

    const byTitle = (t) => createdCourses.find((c) => c.title === t);
    const math = byTitle('Advanced Mathematics');
    const physics = byTitle('Quantum Physics');
    const english = byTitle('English Literature');
    const envSci = byTitle('Environmental Science');
    byTitle('Computer Science Fundamentals');

    // Enrollments
    await prisma.enrollment.createMany({
      data: [
        { studentId: studentArjun.id, courseId: math.id, progress: 65, isCompleted: false },
        { studentId: studentArjun.id, courseId: physics.id, progress: 40, isCompleted: false },
        { studentId: studentArjun.id, courseId: english.id, progress: 100, isCompleted: true, grade: 'A', score: 92, completedAt: new Date('2026-06-01T00:00:00Z') },
        { studentId: studentPriya.id, courseId: math.id, progress: 80, isCompleted: false },
        { studentId: studentAnanya.id, courseId: envSci.id, progress: 100, isCompleted: true, grade: 'A-', score: 88, completedAt: new Date('2026-06-10T00:00:00Z') },
      ],
    });
    console.log('Created enrollments');

    // Assignments
    const teacher = teacherMap['Dr. Verma'];
    await prisma.assignment.create({ data: { courseId: math.id, title: 'Calculus Problem Set', description: 'Solve 10 calculus problems', dueDate: new Date('2026-06-15T23:59:59Z'), maxMarks: 100, status: 'published', createdById: teacher.id } });
    const a2 = await prisma.assignment.create({ data: { courseId: physics.id, title: 'Physics Lab Report', description: 'Write a lab report on quantum entanglement', dueDate: new Date('2026-06-20T23:59:59Z'), maxMarks: 50, status: 'published', createdById: teacherMap['Prof. Kumar'].id } });
    const a3 = await prisma.assignment.create({ data: { courseId: english.id, title: 'Shakespeare Essay', description: 'Write a 2000 word essay on Hamlet', dueDate: new Date('2026-05-10T23:59:59Z'), maxMarks: 100, status: 'published', createdById: teacherMap['Ms. Singh'].id } });
    console.log('Created assignments');

    // Submissions
    await prisma.assignmentSubmission.createMany({
      data: [
        { assignmentId: a2.id, studentId: studentArjun.id, content: 'Lab report content...', status: 'submitted', submittedAt: new Date('2026-06-19T10:00:00Z') },
        { assignmentId: a3.id, studentId: studentArjun.id, content: 'Shakespeare essay content...', marks: 88, feedback: 'Excellent analysis!', status: 'graded', submittedAt: new Date('2026-05-08T10:00:00Z'), gradedAt: new Date('2026-05-12T10:00:00Z') },
      ],
    });
    console.log('Created submissions');

    // Attendance for Arjun (30 days from May 1)
    const attendanceRows = [];
    for (let day = 1; day <= 30; day++) {
      const date = new Date(2026, 4, day);
      const dow = date.getDay();
      let status = 'present';
      let remark = '';
      if (dow === 0) { status = 'holiday'; remark = 'Weekly holiday'; }
      else if (day % 5 === 0) { status = 'absent'; remark = 'Medical appointment'; }
      else if (day % 7 === 0) { status = 'leave'; remark = 'Family function'; }
      attendanceRows.push({ studentId: studentArjun.id, courseId: math.id, date, status, remark, markedById: teacher.id });
    }
    await prisma.attendance.createMany({ data: attendanceRows });
    console.log('Created attendance records');

    // Certificates
    await prisma.certificate.create({
      data: {
        studentId: studentArjun.id,
        courseId: english.id,
        title: 'English Literature - Certificate',
        grade: 'A',
        percentage: 92,
        score: 92,
        completionDate: new Date('2026-06-01T00:00:00Z'),
        issuedAt: new Date('2026-06-01T00:00:00Z'),
      },
    });
    await prisma.certificate.create({
      data: {
        studentId: studentAnanya.id,
        courseId: envSci.id,
        title: 'Environmental Science - Certificate',
        grade: 'A-',
        percentage: 88,
        score: 88,
        completionDate: new Date('2026-06-10T00:00:00Z'),
        issuedAt: new Date('2026-06-10T00:00:00Z'),
      },
    });
    console.log('Created certificates');

    // Achievements
    const achievements = [];
    for (const a of achievementSeed) {
      achievements.push(await prisma.achievement.create({ data: a }));
    }
    await prisma.userAchievement.createMany({
      data: achievements.map((a) => ({ userId: studentArjun.id, achievementId: a.id })),
    });
    console.log('Created achievements');

    // Skills
    const skills = ['Critical Thinking', 'Communication', 'Mathematics', 'Physics', 'Programming', 'Public Speaking', 'Environmental Awareness', 'Music Theory'];
    const skillRows = [];
    for (const name of skills) {
      skillRows.push(await prisma.skill.create({ data: { name, description: `${name} proficiency skill` } }));
    }
    await prisma.userSkill.createMany({
      data: [
        { userId: studentArjun.id, skillId: skillRows[0].id, level: 70, xp: 700 },
        { userId: studentArjun.id, skillId: skillRows[2].id, level: 80, xp: 800 },
        { userId: studentArjun.id, skillId: skillRows[3].id, level: 65, xp: 650 },
        { userId: studentPriya.id, skillId: skillRows[2].id, level: 90, xp: 900 },
        { userId: studentAnanya.id, skillId: skillRows[6].id, level: 75, xp: 750 },
      ],
    });
    console.log('Created skills');

    // Notifications
    await prisma.notification.createMany({
      data: [
        { userId: studentArjun.id, title: 'Welcome!', message: 'Your account is ready. Explore courses and start learning.', type: 'info', category: 'system' },
        { userId: studentArjun.id, title: 'Assignment graded', message: 'Your Shakespeare Essay was graded: 88/100', type: 'success', category: 'grade', link: `/assignments/${a3.id}` },
        { userId: studentArjun.id, title: 'New certificate', message: 'You earned a certificate in English Literature!', type: 'success', category: 'certificate' },
      ],
    });
    console.log('Created notifications');

    // Messages
    await prisma.message.createMany({
      data: [
        { senderId: teacher.id, receiverId: studentArjun.id, subject: 'Welcome to Advanced Mathematics', content: 'Welcome to the course! Please complete Module 1 this week.', isRead: true, readAt: new Date() },
        { senderId: studentArjun.id, receiverId: teacher.id, subject: 'Question about limits', content: 'Could you clarify the epsilon-delta definition?', isRead: false },
      ],
    });
    console.log('Created messages');

    console.log('\n✅ Seed completed successfully!');
    console.log(`Users: admin@school.com / password123 | teacher: verma@school.com / password123 | student: arjun@school.com / password123 | parent: parent-arjun@school.com / password123`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

seed();
