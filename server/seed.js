const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = require('./prisma');

// ============================================================
// COLLEGE SEED — ISDS College of Engineering & Management
// ============================================================

const departmentSeed = [
  { name: 'Computer Science & Engineering', code: 'CSE', description: 'Core computer science, software systems and programming' },
  { name: 'Information Technology', code: 'IT', description: 'IT infrastructure, networks and software applications' },
  { name: 'Artificial Intelligence & Data Science', code: 'AI', description: 'Machine learning, data science and intelligent systems' },
  { name: 'Electronics & Communication', code: 'ECE', description: 'Electronics, signal processing and communication systems' },
  { name: 'Mechanical Engineering', code: 'ME', description: 'Mechanics, design and manufacturing' },
  { name: 'Civil Engineering', code: 'CE', description: 'Structural, geotechnical and environmental engineering' },
  { name: 'Management Studies', code: 'MBA', description: 'Business administration and management' },
  { name: 'Science & Humanities', code: 'SH', description: 'Mathematics, physics, languages and liberal arts' },
];

const programSeed = [
  { name: 'B.Tech Information Technology', code: 'B.TECH-IT', dept: 'IT', level: 'UG', durationYears: 4, creditsRequired: 160 },
  { name: 'B.Tech Computer Science', code: 'B.TECH-CSE', dept: 'CSE', level: 'UG', durationYears: 4, creditsRequired: 160 },
  { name: 'B.Tech Artificial Intelligence', code: 'B.TECH-AI', dept: 'AI', level: 'UG', durationYears: 4, creditsRequired: 160 },
  { name: 'B.Tech Electronics & Communication', code: 'B.TECH-ECE', dept: 'ECE', level: 'UG', durationYears: 4, creditsRequired: 160 },
  { name: 'B.Tech Mechanical', code: 'B.TECH-ME', dept: 'ME', level: 'UG', durationYears: 4, creditsRequired: 160 },
  { name: 'B.Tech Civil', code: 'B.TECH-CE', dept: 'CE', level: 'UG', durationYears: 4, creditsRequired: 160 },
  { name: 'MBA', code: 'MBA', dept: 'MBA', level: 'PG', durationYears: 2, creditsRequired: 80 },
  { name: 'B.Sc Computer Science', code: 'BSC-CS', dept: 'SH', level: 'UG', durationYears: 3, creditsRequired: 120 },
];

const facultySeed = [
  { name: 'Dr. Verma', email: 'verma@college.edu', subject: 'Mathematics', employeeId: 'F-101', dept: 'SH', designation: 'Professor & Head' },
  { name: 'Prof. Kumar', email: 'kumar@college.edu', subject: 'Engineering Physics', employeeId: 'F-102', dept: 'SH', designation: 'Professor' },
  { name: 'Ms. Singh', email: 'singh@college.edu', subject: 'Technical Communication', employeeId: 'F-103', dept: 'SH', designation: 'Associate Professor' },
  { name: 'Dr. Gupta', email: 'gupta@college.edu', subject: 'Environmental Science', employeeId: 'F-104', dept: 'SH', designation: 'Assistant Professor' },
  { name: 'Ms. Patel', email: 'patel@college.edu', subject: 'Professional Communication', employeeId: 'F-105', dept: 'SH', designation: 'Assistant Professor' },
  { name: 'Mr. Raj', email: 'raj@college.edu', subject: 'Computer Science', employeeId: 'F-106', dept: 'CSE', designation: 'Assistant Professor' },
  { name: 'Dr. Mehta', email: 'mehta@college.edu', subject: 'Data Structures & Algorithms', employeeId: 'F-107', dept: 'IT', designation: 'Associate Professor' },
  { name: 'Prof. Iyer', email: 'iyer@college.edu', subject: 'Machine Learning', employeeId: 'F-108', dept: 'AI', designation: 'Professor' },
];

const studentSeed = [
  { name: 'Arjun Sharma', email: 'arjun@college.edu', password: 'password123', role: 'student', class: 'Sem 3', section: 'A', semester: 3, batch: '2024', registerNumber: '21IT301', rollNumber: '301', dept: 'IT', program: 'B.Tech Information Technology', faculty: 'Dr. Mehta', phone: '+91 98765 43210', cgpa: 8.6, currentSemesterGpa: 8.2, creditsEarned: 92, creditsRequired: 160, backlogs: 0, placementStatus: 'eligible', careerGoal: 'Full Stack Software Engineer', github: 'https://github.com/arjun', leetcode: 'https://leetcode.com/arjun21', codeforces: 'https://codeforces.com/profile/arjun21', hackerrank: 'https://hackerrank.com/arjun21' },
  { name: 'Priya Patel', email: 'priya@college.edu', password: 'password123', role: 'student', class: 'Sem 3', section: 'A', semester: 3, batch: '2024', registerNumber: '21CS302', rollNumber: '302', dept: 'CSE', program: 'B.Tech Computer Science', faculty: 'Mr. Raj', phone: '+91 98765 43211', cgpa: 9.1, currentSemesterGpa: 8.9, creditsEarned: 95, creditsRequired: 160, backlogs: 0, placementStatus: 'eligible', careerGoal: 'Data Scientist' },
  { name: 'Rahul Singh', email: 'rahul@college.edu', password: 'password123', role: 'student', class: 'Sem 3', section: 'B', semester: 3, batch: '2024', registerNumber: '21EC303', rollNumber: '303', dept: 'ECE', program: 'B.Tech Electronics & Communication', faculty: 'Prof. Kumar', phone: '+91 98765 43212', cgpa: 7.4, currentSemesterGpa: 7.1, creditsEarned: 88, creditsRequired: 160, backlogs: 1, placementStatus: 'not_eligible', careerGoal: 'VLSI Design Engineer' },
  { name: 'Ananya Gupta', email: 'ananya@college.edu', password: 'password123', role: 'student', class: 'Sem 3', section: 'A', semester: 3, batch: '2024', registerNumber: '21AI304', rollNumber: '304', dept: 'AI', program: 'B.Tech Artificial Intelligence', faculty: 'Prof. Iyer', phone: '+91 98765 43213', cgpa: 8.9, currentSemesterGpa: 9.0, creditsEarned: 94, creditsRequired: 160, backlogs: 0, placementStatus: 'eligible', careerGoal: 'Machine Learning Engineer' },
];

const courseSeed = [
  { code: 'MAT201', title: 'Advanced Mathematics', domain: 'Science & Humanities', type: 'core', creditPoints: 4, instructor: 'Dr. Verma', duration: '12 weeks', difficulty: 'advanced', modules: [{ title: 'Module 1: Algebra', lessons: [{ title: 'Introduction to Algebra', videoUrl: 'https://youtu.be/NybHckSEQBI' }, { title: 'Linear Equations', videoUrl: 'https://youtu.be/Ft2_QtXAnh8' }, { title: 'Quadratic Equations', videoUrl: 'https://youtu.be/1F1LQh1_sNc' }] }, { title: 'Module 2: Calculus', lessons: [{ title: 'Limits & Continuity', videoUrl: 'https://youtu.be/9I7TVGvnIDg' }, { title: 'Derivatives', videoUrl: 'https://youtu.be/PIWAkMpGZTs' }, { title: 'Integration', videoUrl: 'https://youtu.be/JWlKfQ3MBXU' }] }] },
  { code: 'PHY201', title: 'Engineering Physics', domain: 'Science & Humanities', type: 'core', creditPoints: 3, instructor: 'Prof. Kumar', duration: '10 weeks', difficulty: 'advanced', modules: [{ title: 'Module 1: Quantum Mechanics', lessons: [{ title: 'Introduction to Quantum', videoUrl: 'https://youtu.be/JzIYSr3k5_s' }, { title: 'Wave-Particle Duality', videoUrl: 'https://youtu.be/Q_h4IoPJXZw' }] }] },
  { code: 'HUM201', title: 'Technical Communication', domain: 'Science & Humanities', type: 'core', creditPoints: 3, instructor: 'Ms. Singh', duration: '8 weeks', difficulty: 'intermediate', modules: [{ title: 'Module 1: Technical Writing', lessons: [{ title: 'Technical Reports', videoUrl: '' }, { title: 'Presentations', videoUrl: '' }] }] },
  { code: 'CSS201', title: 'Operating Systems', domain: 'Engineering', type: 'core', creditPoints: 4, instructor: 'Mr. Raj', duration: '12 weeks', difficulty: 'intermediate', modules: [{ title: 'Module 1: OS Fundamentals', lessons: [{ title: 'Processes & Threads', videoUrl: '' }, { title: 'Scheduling', videoUrl: '' }] }] },
  { code: 'ENV201', title: 'Environmental Science & Engineering', domain: 'Science & Humanities', type: 'core', creditPoints: 3, instructor: 'Dr. Gupta', duration: '10 weeks', difficulty: 'intermediate', modules: [{ title: 'Module 1: Ecosystems', lessons: [{ title: 'Introduction', videoUrl: '' }, { title: 'Ecosystem Types', videoUrl: '' }] }] },
  { code: 'HUM202', title: 'Professional Communication', domain: 'Co-curricular', type: 'elective', creditPoints: 2, instructor: 'Ms. Patel', duration: '6 weeks', difficulty: 'intermediate', modules: [] },
  { code: 'CSF101', title: 'Programming Fundamentals', domain: 'Engineering', type: 'core', creditPoints: 4, instructor: 'Mr. Raj', duration: '12 weeks', difficulty: 'intermediate', modules: [] },
  { code: 'CSD201', title: 'Database Management Systems', domain: 'Engineering', type: 'core', creditPoints: 4, instructor: 'Dr. Mehta', duration: '12 weeks', difficulty: 'intermediate', modules: [] },
];

const achievementSeed = [
  { name: 'First Course Complete', description: 'Completed your first course!', icon: 'trophy', type: 'course_completion', points: 50 },
  { name: 'Perfect Attendance - April', description: '100% attendance in April 2026', icon: 'star', type: 'attendance_perfect', points: 30 },
  { name: 'Top 3 in Semester', description: 'Ranked in the top 3 of the semester examinations', icon: 'medal', type: 'leaderboard_top', points: 100 },
  { name: '5 Certificates Earned', description: 'Completed 5 courses', icon: 'award', type: 'course_completion', points: 200 },
];

async function clearAll() {
  const order = [
    prisma.internship.deleteMany({}),
    prisma.researchPaper.deleteMany({}),
    prisma.projectReview.deleteMany({}),
    prisma.project.deleteMany({}),
    prisma.jobApplication.deleteMany({}),
    prisma.job.deleteMany({}),
    prisma.careerProfile.deleteMany({}),
    prisma.plannerTask.deleteMany({}),
    prisma.codeSubmission.deleteMany({}),
    prisma.codingProblem.deleteMany({}),
    prisma.interviewSession.deleteMany({}),
    prisma.interviewQuestion.deleteMany({}),
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
    prisma.semester.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.program.deleteMany({}),
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

    // ------------------------------------------------------------
    // Departments
    // ------------------------------------------------------------
    const departments = {};
    for (const d of departmentSeed) {
      departments[d.code] = await prisma.department.create({ data: { name: d.name, code: d.code, description: d.description } });
    }
    console.log(`Created ${departmentSeed.length} departments`);

    // ------------------------------------------------------------
    // Programs + Semesters
    // ------------------------------------------------------------
    const programs = {};
    for (const p of programSeed) {
      const program = await prisma.program.create({
        data: { name: p.name, code: p.code, departmentId: departments[p.dept].id, level: p.level, durationYears: p.durationYears, creditsRequired: p.creditsRequired },
      });
      programs[p.name] = program;
      for (let n = 1; n <= p.durationYears * 2; n++) {
        await prisma.semester.create({ data: { programId: program.id, number: n, name: `Semester ${n}`, isActive: n === 3 } });
      }
    }
    console.log(`Created ${programSeed.length} programs with semesters`);

    // ------------------------------------------------------------
    // Users
    // ------------------------------------------------------------
    await prisma.user.create({ data: { name: 'Admin User', email: 'admin@college.edu', password: hash('password123'), role: 'admin', isVerified: true } });

    const facultyMap = {};
    for (const f of facultySeed) {
      facultyMap[f.name] = await prisma.user.create({
        data: { name: f.name, email: f.email, password: hash('password123'), role: 'teacher', subject: f.subject, employeeId: f.employeeId, departmentId: departments[f.dept].id, bio: `${f.designation}, Department of ${departments[f.dept].name}`, isVerified: true },
      });
    }

    const students = [];
    for (const s of studentSeed) {
      const u = await prisma.user.create({
        data: {
          name: s.name, email: s.email, password: hash(s.password), role: 'student',
          class: s.class, section: s.section, semester: s.semester, batch: s.batch,
          registerNumber: s.registerNumber, rollNumber: s.rollNumber,
          departmentId: departments[s.dept].id, programId: programs[s.program].id,
          facultyAdvisorId: facultyMap[s.faculty].id,
          cgpa: s.cgpa, currentSemesterGpa: s.currentSemesterGpa, creditsEarned: s.creditsEarned, creditsRequired: s.creditsRequired,
          backlogs: s.backlogs, placementStatus: s.placementStatus, careerGoal: s.careerGoal,
          github: s.github, leetcode: s.leetcode, codeforces: s.codeforces, hackerrank: s.hackerrank,
          phone: s.phone, isVerified: true,
        },
      });
      students.push(u);
    }
    console.log(`Created ${1 + facultySeed.length + students.length} users`);

    // Parent/guardian accounts linked to students
    const parentDefs = [
      { name: 'Parent of Arjun', email: 'parent-arjun@college.edu', student: 'arjun@college.edu' },
      { name: 'Parent of Priya', email: 'parent-priya@college.edu', student: 'priya@college.edu' },
      { name: 'Parent of Ananya', email: 'parent-ananya@college.edu', student: 'ananya@college.edu' },
    ];
    for (const p of parentDefs) {
      const student = students.find((s) => s.email === p.student);
      await prisma.user.create({ data: { name: p.name, email: p.email, password: hash('password123'), role: 'parent', isVerified: true, studentIds: JSON.stringify([student.id]) } });
    }

    const recruiter = await prisma.user.create({ data: { name: 'Sana Kapoor', email: 'recruiter@college.edu', password: hash('password123'), role: 'recruiter', employeeId: 'R-101', isVerified: true } });

    const studentArjun = students.find((s) => s.email === 'arjun@college.edu');
    const studentPriya = students.find((s) => s.email === 'priya@college.edu');
    const studentAnanya = students.find((s) => s.email === 'ananya@college.edu');

    // ------------------------------------------------------------
    // Courses
    // ------------------------------------------------------------
    const createdCourses = [];
    for (const c of courseSeed) {
      const instructor = facultyMap[c.instructor];
      const course = await prisma.course.create({
        data: {
          code: c.code,
          title: c.title,
          description: `${c.domain} · ${c.duration} · ${c.creditPoints} credits`,
          instructorId: instructor.id,
          departmentId: departments[instructor.dept || 'SH'].id,
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
    const physics = byTitle('Engineering Physics');
    const english = byTitle('Technical Communication');
    const envSci = byTitle('Environmental Science & Engineering');
    byTitle('Programming Fundamentals');

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
    const teacher = facultyMap['Dr. Verma'];
    await prisma.assignment.create({ data: { courseId: math.id, title: 'Calculus Problem Set', description: 'Solve 10 calculus problems', dueDate: new Date('2026-06-15T23:59:59Z'), maxMarks: 100, status: 'published', createdById: teacher.id } });
    const a2 = await prisma.assignment.create({ data: { courseId: physics.id, title: 'Physics Lab Report', description: 'Write a lab report on quantum entanglement', dueDate: new Date('2026-06-20T23:59:59Z'), maxMarks: 50, status: 'published', createdById: facultyMap['Prof. Kumar'].id } });
    const a3 = await prisma.assignment.create({ data: { courseId: english.id, title: 'Technical Report Essay', description: 'Write a technical report on a topic of your choice', dueDate: new Date('2026-05-10T23:59:59Z'), maxMarks: 100, status: 'published', createdById: facultyMap['Ms. Singh'].id } });
    console.log('Created assignments');

    // Submissions
    await prisma.assignmentSubmission.createMany({
      data: [
        { assignmentId: a2.id, studentId: studentArjun.id, content: 'Lab report content...', status: 'submitted', submittedAt: new Date('2026-06-19T10:00:00Z') },
        { assignmentId: a3.id, studentId: studentArjun.id, content: 'Technical report content...', marks: 88, feedback: 'Excellent analysis!', status: 'graded', submittedAt: new Date('2026-05-08T10:00:00Z'), gradedAt: new Date('2026-05-12T10:00:00Z') },
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
        title: 'Technical Communication - Certificate',
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
        title: 'Environmental Science & Engineering - Certificate',
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

    // Skills catalog (names match server/config/career.js SKILL_COURSE_KEYWORDS)
    const skillNames = [
      'Python', 'JavaScript', 'Java', 'C', 'C++', 'SQL', 'React', 'Node.js', 'Web Development',
      'Machine Learning', 'Statistics', 'Data Visualization', 'Data Structures & Algorithms',
      'Operating Systems', 'Networking', 'Cybersecurity', 'System Design', 'Mathematics',
      'Physics', 'Communication', 'Critical Thinking', 'Public Speaking',
    ];
    const skillRows = [];
    for (const name of skillNames) {
      skillRows.push(await prisma.skill.create({ data: { name, description: `${name} proficiency skill`, category: 'General' } }));
    }
    const skillId = (name) => skillRows.find((s) => s.name === name).id;
    await prisma.userSkill.createMany({
      data: [
        { userId: studentArjun.id, skillId: skillId('Mathematics'), level: 80, xp: 800 },
        { userId: studentArjun.id, skillId: skillId('Physics'), level: 65, xp: 650 },
        { userId: studentArjun.id, skillId: skillId('Communication'), level: 70, xp: 700 },
        { userId: studentArjun.id, skillId: skillId('Critical Thinking'), level: 75, xp: 750 },
        { userId: studentArjun.id, skillId: skillId('JavaScript'), level: 60, xp: 600 },
        { userId: studentPriya.id, skillId: skillId('Mathematics'), level: 90, xp: 900 },
        { userId: studentPriya.id, skillId: skillId('Python'), level: 72, xp: 720 },
        { userId: studentAnanya.id, skillId: skillId('Communication'), level: 75, xp: 750 },
        { userId: studentAnanya.id, skillId: skillId('Public Speaking'), level: 70, xp: 700 },
      ],
    });
    console.log('Created skills');

    // Notifications
    await prisma.notification.createMany({
      data: [
        { userId: studentArjun.id, title: 'Welcome!', message: 'Your account is ready. Explore courses and start learning.', type: 'info', category: 'system' },
        { userId: studentArjun.id, title: 'Assignment graded', message: 'Your Technical Report was graded: 88/100', type: 'success', category: 'grade', link: `/assignments/${a3.id}` },
        { userId: studentArjun.id, title: 'New certificate', message: 'You earned a certificate in Technical Communication!', type: 'success', category: 'certificate' },
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

    // ------------------------------------------------------------
    // Internships
    // ------------------------------------------------------------
    await prisma.internship.createMany({
      data: [
        { studentId: studentArjun.id, company: 'TechNova Solutions', role: 'Software Development Intern', startDate: new Date('2026-01-01T00:00:00Z'), endDate: new Date('2026-04-30T00:00:00Z'), status: 'completed', mentorName: 'Anil Rao', summary: 'Built REST APIs and React dashboards for a student-facing product.', isVerified: true },
        { studentId: studentArjun.id, company: 'Campus Club', role: 'Web Development Intern (Virtual)', startDate: new Date('2025-06-01T00:00:00Z'), endDate: new Date('2025-08-31T00:00:00Z'), status: 'completed', mentorName: 'Ravi Menon', summary: 'Developed event pages and internal dashboards.' },
        { studentId: studentAnanya.id, company: 'AeroML Labs', role: 'ML Research Intern', startDate: new Date('2026-05-01T00:00:00Z'), status: 'ongoing', mentorName: 'Prof. Iyer', summary: 'Working on NLP-based document classification.' },
      ],
    });
    console.log('Created internships');

    // ------------------------------------------------------------
    // Research papers
    // ------------------------------------------------------------
    await prisma.researchPaper.createMany({
      data: [
        { studentId: studentArjun.id, title: 'Adaptive Learning Path Generation using Knowledge Graphs', type: 'conference', venue: 'ICACCT 2026', year: 2026, authors: JSON.stringify(['Arjun Sharma', 'Dr. Mehta', 'Prof. Iyer']), doi: '10.1109/ICACCT.2026.00012', link: 'https://ieeexplore.ieee.org/document/1234567', status: 'published', isVerified: true },
        { studentId: studentArjun.id, title: 'Optimizing Student Habit Tracking with PWA Architecture', type: 'journal', venue: 'International Journal of Emerging Technologies', year: 2025, authors: JSON.stringify(['Arjun Sharma']), status: 'under_review' },
      ],
    });
    console.log('Created research papers');

    // ------------------------------------------------------------
    // Career profiles
    // ------------------------------------------------------------
    await prisma.careerProfile.create({
      data: {
        studentId: studentArjun.id,
        headline: 'Aspiring Full Stack Developer',
        summary: 'Enthusiastic college student passionate about web development, mathematics, and building real-world tools.',
        github: 'https://github.com/arjun',
        linkedin: 'https://linkedin.com/in/arjun',
        portfolioUrl: 'https://arjun.dev',
        education: JSON.stringify([{ degree: 'B.Tech Information Technology', institution: 'ISDS College of Engineering & Management', year: '2028', score: '8.6 CGPA' }]),
        experience: JSON.stringify([{ title: 'Software Development Intern', company: 'TechNova Solutions', startDate: '2026-01', endDate: '2026-04', description: 'Built REST APIs and React dashboards' }]),
        isPublic: true,
      },
    });
    await prisma.careerProfile.create({
      data: { studentId: studentPriya.id, headline: 'Mathematics & Data Enthusiast', summary: 'Top student in advanced mathematics with strong Python foundations.', isPublic: true },
    });
    console.log('Created career profiles');

    // ------------------------------------------------------------
    // Projects
    // ------------------------------------------------------------
    const projectArjun = await prisma.project.create({
      data: {
        studentId: studentArjun.id,
        title: 'Campus Habit Tracker',
        description: 'A web app that helps students track study streaks, planner tasks, and attendance risk.',
        techStack: JSON.stringify(['React', 'Node.js', 'JavaScript']),
        githubUrl: 'https://github.com/arjun/habit-tracker',
        demoUrl: 'https://habit-tracker.arjun.dev',
        status: 'development',
        visibility: 'public',
        mentorId: teacher.id,
        mentorName: 'Dr. Verma',
        team: JSON.stringify([{ name: 'Arjun Sharma', role: 'Developer' }]),
      },
    });
    await prisma.project.create({
      data: {
        studentId: studentArjun.id,
        title: 'Math Quiz Generator',
        description: 'Generates adaptive mathematics quizzes for first-year engineering courses with difficulty scaling.',
        techStack: JSON.stringify(['JavaScript', 'React']),
        githubUrl: 'https://github.com/arjun/math-quiz',
        status: 'completed',
        visibility: 'public',
        team: JSON.stringify([]),
      },
    });
    await prisma.project.create({
      data: {
        studentId: studentPriya.id,
        title: 'Data Science Notebooks',
        description: 'A collection of statistics and data visualization notebooks.',
        techStack: JSON.stringify(['Python', 'Data Visualization']),
        status: 'planning',
        visibility: 'public',
        team: JSON.stringify([]),
      },
    });
    await prisma.projectReview.create({
      data: {
        projectId: projectArjun.id,
        reviewerId: teacher.id,
        rating: 4,
        feedback: 'Great architecture. Add test coverage before submission.',
      },
    });
    await prisma.project.update({
      where: { id: projectArjun.id },
      data: { evaluation: JSON.stringify({ avgRating: 4, count: 1, reviewedAt: new Date() }) },
    });
    console.log('Created projects');

    // ------------------------------------------------------------
    // Jobs + applications
    // ------------------------------------------------------------
    await prisma.job.create({
      data: {
        title: 'Junior Web Developer (Internship)',
        company: 'TechNova Solutions',
        type: 'internship',
        description: 'Assist in building React frontends and Node.js APIs for student-facing products.',
        location: 'Remote',
        stipend: '₹15,000/month',
        minCGPA: 8,
        minAttendance: 75,
        minProjects: 1,
        requiredSkills: JSON.stringify(['JavaScript', 'React', 'Node.js']),
        minSkillScore: 60,
        experienceLevel: 'internship',
        status: 'open',
        deadline: new Date('2026-09-30T23:59:59Z'),
        postedById: recruiter.id,
      },
    });
    await prisma.job.create({
      data: {
        title: 'Data Analyst Trainee',
        company: 'Insight Analytics',
        type: 'placement_drive',
        description: 'Trainee role for freshers with strong SQL and statistics foundations.',
        location: 'Bengaluru',
        stipend: '₹25,000/month',
        minCGPA: 8.5,
        minAttendance: 80,
        minProjects: 0,
        requiredSkills: JSON.stringify(['SQL', 'Statistics']),
        minSkillScore: 65,
        status: 'open',
        deadline: new Date('2026-08-31T23:59:59Z'),
        postedById: recruiter.id,
      },
    });
    await prisma.job.create({
      data: {
        title: 'Campus Ambassador',
        company: 'EduConnect',
        type: 'job',
        description: 'Represent EduConnect on campus and run awareness drives.',
        location: 'On-campus',
        stipend: 'Stipend + incentives',
        minCGPA: 7,
        minProjects: 0,
        requiredSkills: JSON.stringify(['Communication']),
        minSkillScore: 0,
        status: 'draft',
        postedById: recruiter.id,
      },
    });
    console.log('Created jobs');

    // ------------------------------------------------------------
    // Planner tasks
    // ------------------------------------------------------------
    await prisma.plannerTask.createMany({
      data: [
        { studentId: studentArjun.id, title: 'Finish: Calculus Problem Set', subject: 'Advanced Mathematics', date: new Date('2026-06-15T00:00:00Z'), duration: 90, priority: 'high', status: 'pending', deadline: new Date('2026-06-15T23:59:59Z'), source: 'assignment' },
        { studentId: studentArjun.id, title: 'Study: Engineering Physics (40% left)', subject: 'Engineering Physics', date: new Date('2026-06-18T00:00:00Z'), duration: 60, priority: 'medium', status: 'pending', source: 'course' },
        { studentId: studentArjun.id, title: 'Revise Technical Communication notes', subject: 'Technical Communication', date: new Date('2026-06-10T00:00:00Z'), duration: 45, priority: 'low', status: 'completed', source: 'manual' },
      ],
    });
    console.log('Created planner tasks');

    // ------------------------------------------------------------
    // Coding problems
    // ------------------------------------------------------------
    const codingInstructor = facultyMap['Mr. Raj'];
    await prisma.codingProblem.create({
      data: {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
        difficulty: 'beginner',
        topics: JSON.stringify(['arrays', 'hash-map']),
        languages: JSON.stringify(['javascript', 'python']),
        starterCode: JSON.stringify({ javascript: 'function twoSum(nums, target) {\n  // your code\n}', python: 'def two_sum(nums, target):\n    pass' }),
        testCases: JSON.stringify([{ input: '[2,7,11,15], 9', expected: '[0,1]' }, { input: '[3,2,4], 6', expected: '[1,2]' }]),
        examples: JSON.stringify([{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' }]),
        constraints: '2 <= nums.length <= 10^4',
        status: 'published',
        createdById: codingInstructor.id,
      },
    });
    await prisma.codingProblem.create({
      data: {
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid.',
        difficulty: 'intermediate',
        topics: JSON.stringify(['stack', 'strings']),
        languages: JSON.stringify(['javascript', 'python']),
        starterCode: JSON.stringify({ javascript: 'function isValid(s) {\n  // your code\n}', python: 'def is_valid(s):\n    pass' }),
        testCases: JSON.stringify([{ input: '"()"', expected: 'true' }, { input: '"()[]{}"', expected: 'true' }, { input: '"(]"', expected: 'false' }]),
        examples: JSON.stringify([{ input: 's = "()"', output: 'true' }, { input: 's = "(]"', output: 'false' }]),
        constraints: '1 <= s.length <= 10^4',
        status: 'published',
        createdById: codingInstructor.id,
      },
    });
    await prisma.codingProblem.create({
      data: {
        title: 'LRU Cache',
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
        difficulty: 'advanced',
        topics: JSON.stringify(['design', 'linked-list']),
        languages: JSON.stringify(['javascript', 'python']),
        starterCode: JSON.stringify({ javascript: 'class LRUCache {\n  constructor(capacity) {}\n}', python: 'class LRUCache:\n    def __init__(self, capacity):\n        pass' }),
        status: 'draft',
        createdById: codingInstructor.id,
      },
    });
    console.log('Created coding problems');

    // ------------------------------------------------------------
    // Interview questions
    // ------------------------------------------------------------
    const interviewQuestions = [
      { role: 'full_stack_developer', category: 'fundamentals', level: 'basic', question: 'Explain the difference between var, let, and const in JavaScript.', keywords: JSON.stringify(['var', 'let', 'const', 'scope', 'block']) },
      { role: 'full_stack_developer', category: 'web', level: 'basic', question: 'What is the difference between GET and POST requests?', keywords: JSON.stringify(['get', 'post', 'http', 'body', 'url']) },
      { role: 'full_stack_developer', category: 'frontend', level: 'intermediate', question: 'Explain how React handles state and why props are immutable.', keywords: JSON.stringify(['react', 'state', 'props', 'component', 'render']) },
      { role: 'full_stack_developer', category: 'backend', level: 'intermediate', question: 'Describe how a REST API request flows through a typical Node.js application.', keywords: JSON.stringify(['request', 'express', 'route', 'middleware', 'response', 'api']) },
      { role: 'full_stack_developer', category: 'databases', level: 'advanced', question: 'How would you design a database schema for a multi-user task planner?', keywords: JSON.stringify(['schema', 'users', 'tasks', 'foreign key', 'index', 'relations']) },
      { role: 'ai_engineer', category: 'fundamentals', level: 'basic', question: 'What is the difference between supervised and unsupervised learning?', keywords: JSON.stringify(['supervised', 'unsupervised', 'labels', 'training', 'clustering']) },
      { role: 'ai_engineer', category: 'ml', level: 'intermediate', question: 'Explain the bias-variance tradeoff with examples.', keywords: JSON.stringify(['bias', 'variance', 'overfitting', 'underfitting', 'model']) },
      { role: 'ai_engineer', category: 'ml', level: 'advanced', question: 'Walk through the steps of training and evaluating a classification model.', keywords: JSON.stringify(['data', 'features', 'train', 'test', 'accuracy', 'evaluate', 'model']) },
      { role: 'data_analyst', category: 'sql', level: 'basic', question: 'What is a SQL JOIN and what types of joins exist?', keywords: JSON.stringify(['sql', 'join', 'inner', 'outer', 'left', 'right', 'tables']) },
      { role: 'data_analyst', category: 'statistics', level: 'intermediate', question: 'Explain the difference between correlation and causation.', keywords: JSON.stringify(['correlation', 'causation', 'variables', 'relationship', 'confound']) },
      { role: 'data_analyst', category: 'visualization', level: 'advanced', question: 'How do you choose the right chart type for a given dataset?', keywords: JSON.stringify(['chart', 'data', 'bar', 'line', 'scatter', 'audience', 'insight']) },
      { role: 'communication', category: 'interview', level: 'basic', question: 'Tell me about yourself in under two minutes.', keywords: JSON.stringify(['name', 'interest', 'strength', 'experience', 'goal']) },
      { role: 'communication', category: 'interview', level: 'intermediate', question: 'Describe a time you faced a challenge and how you resolved it.', keywords: JSON.stringify(['challenge', 'problem', 'action', 'result', 'learned']) },
      { role: 'communication', category: 'interview', level: 'advanced', question: 'Why should we hire you for this role?', keywords: JSON.stringify(['skills', 'match', 'value', 'enthusiasm', 'experience']) },
    ];
    await prisma.interviewQuestion.createMany({ data: interviewQuestions });
    console.log('Created interview questions');

    // ------------------------------------------------------------
    // Pending certificate for review flow
    // ------------------------------------------------------------
    await prisma.certificate.create({
      data: {
        studentId: studentArjun.id,
        title: 'Python for Beginners — Online Course',
        organization: 'CodeCamp Online',
        source: 'upload',
        status: 'pending',
        visibility: 'public',
        issuedAt: new Date('2026-05-20T00:00:00Z'),
        issueDate: new Date('2026-05-20T00:00:00Z'),
      },
    });
    console.log('Created sample upload certificate');

    console.log('\n✅ Seed completed successfully!');
    console.log(`Users: admin@college.edu / password123 | faculty: verma@college.edu / password123 | student: arjun@college.edu / password123 | parent: parent-arjun@college.edu / password123 | recruiter: recruiter@college.edu / password123`);
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

seed();
