const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const Certificate = require('./models/Certificate');
const Attendance = require('./models/Attendance');
const Trophy = require('./models/Trophy');
const Note = require('./models/Note');

require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/isds';

const users = [
  { name: 'Arjun Sharma', email: 'arjun@school.com', password: 'password123', role: 'student', class: '10A', rollNumber: '1012', parentContact: '+91 98765 43210', credits: 28 },
  { name: 'Priya Patel', email: 'priya@school.com', password: 'password123', role: 'student', class: '10A', rollNumber: '1015', parentContact: '+91 98765 43211', credits: 35 },
  { name: 'Rahul Singh', email: 'rahul@school.com', password: 'password123', role: 'student', class: '10B', rollNumber: '1020', parentContact: '+91 98765 43212', credits: 30 },
  { name: 'Ananya Gupta', email: 'ananya@school.com', password: 'password123', role: 'student', class: '9A', rollNumber: '901', parentContact: '+91 98765 43213', credits: 42 },
  { name: 'Dr. Verma', email: 'verma@school.com', password: 'password123', role: 'teacher', class: '', rollNumber: '', parentContact: '', credits: 0 },
  { name: 'Admin User', email: 'admin@school.com', password: 'password123', role: 'admin', class: '', rollNumber: '', parentContact: '', credits: 0 },
];

const courses = [
  { title: 'Advanced Mathematics', domain: 'Mandatory', type: 'mandatory', creditPoints: 4, instructor: 'Dr. Verma', duration: '12 weeks', difficulty: 'Advanced', status: 'published', modules: [{ title: 'Module 1: Algebra', lessons: [{ title: 'Introduction to Algebra', videoUrl: 'https://youtu.be/NybHckSEQBI' }, { title: 'Linear Equations', videoUrl: 'https://youtu.be/Ft2_QtXAnh8' }, { title: 'Quadratic Equations', videoUrl: 'https://youtu.be/1F1LQh1_sNc' }] }, { title: 'Module 2: Calculus', lessons: [{ title: 'Limits & Continuity', videoUrl: 'https://youtu.be/9I7TVGvnIDg' }, { title: 'Derivatives', videoUrl: 'https://youtu.be/PIWAkMpGZTs' }, { title: 'Integration', videoUrl: 'https://youtu.be/JWlKfQ3MBXU' }] }] },
  { title: 'Quantum Physics', domain: 'Science', type: 'elective', creditPoints: 0, instructor: 'Prof. Kumar', duration: '10 weeks', difficulty: 'Advanced', status: 'published', modules: [{ title: 'Module 1: Basics', lessons: [{ title: 'Introduction to Quantum', videoUrl: 'https://youtu.be/JzIYSr3k5_s' }, { title: 'Wave-Particle Duality', videoUrl: 'https://youtu.be/Q_h4IoPJXZw' }] }] },
  { title: 'English Literature', domain: 'Humanities', type: 'elective', creditPoints: 0, instructor: 'Ms. Singh', duration: '8 weeks', difficulty: 'Intermediate', status: 'published', modules: [{ title: 'Module 1: Poetry', lessons: [{ title: 'Romantic Poetry', videoUrl: '' }, { title: 'Modern Poetry', videoUrl: '' }] }] },
  { title: 'Basketball Fundamentals', domain: 'Physical Education', type: 'elective', creditPoints: 0, instructor: 'Coach Ravi', duration: '6 weeks', difficulty: 'Beginner', status: 'published', modules: [] },
  { title: 'Environmental Science', domain: 'Science', type: 'mandatory', creditPoints: 3, instructor: 'Dr. Gupta', duration: '10 weeks', difficulty: 'Intermediate', status: 'published', modules: [{ title: 'Module 1: Ecosystems', lessons: [{ title: 'Introduction', videoUrl: '' }, { title: 'Ecosystem Types', videoUrl: '' }] }] },
  { title: 'Debate & Communication', domain: 'Co-curricular', type: 'elective', creditPoints: 0, instructor: 'Ms. Patel', duration: '6 weeks', difficulty: 'Intermediate', status: 'published', modules: [] },
  { title: 'Computer Science Fundamentals', domain: 'Engineering', type: 'mandatory', creditPoints: 4, instructor: 'Mr. Raj', duration: '12 weeks', difficulty: 'Intermediate', status: 'published', modules: [] },
  { title: 'Music Theory 101', domain: 'Music', type: 'elective', creditPoints: 0, instructor: 'Mr. Taylor', duration: '8 weeks', difficulty: 'Beginner', status: 'published', modules: [] },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Course.deleteMany({}), Enrollment.deleteMany({}),
      Assignment.deleteMany({}), Submission.deleteMany({}), Certificate.deleteMany({}),
      Attendance.deleteMany({}), Trophy.deleteMany({}), Note.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.insertMany(users.map(u => ({
      ...u,
      password: bcrypt.hashSync(u.password, 12)
    })));
    console.log(`Created ${createdUsers.length} users`);

    const studentArjun = createdUsers.find(u => u.email === 'arjun@school.com');
    const studentPriya = createdUsers.find(u => u.email === 'priya@school.com');
    const studentAnanya = createdUsers.find(u => u.email === 'ananya@school.com');

    // Create courses
    const createdCourses = await Course.insertMany(courses);
    console.log(`Created ${createdCourses.length} courses`);

    const mathCourse = createdCourses.find(c => c.title === 'Advanced Mathematics');
    const envCourse = createdCourses.find(c => c.title === 'Environmental Science');
    const physicsCourse = createdCourses.find(c => c.title === 'Quantum Physics');
    const englishCourse = createdCourses.find(c => c.title === 'English Literature');

    // Enroll Arjun in courses
    await Enrollment.insertMany([
      { userId: studentArjun._id, courseId: mathCourse._id, progress: 65, status: 'in-progress' },
      { userId: studentArjun._id, courseId: physicsCourse._id, progress: 40, status: 'in-progress' },
      { userId: studentArjun._id, courseId: englishCourse._id, progress: 100, status: 'completed' },
      { userId: studentPriya._id, courseId: mathCourse._id, progress: 80, status: 'in-progress' },
      { userId: studentAnanya._id, courseId: envCourse._id, progress: 100, status: 'completed' },
    ]);
    console.log('Created enrollments');

    // Create assignments
    const assignments = await Assignment.insertMany([
      { courseId: mathCourse._id, title: 'Calculus Problem Set', description: 'Solve 10 calculus problems', deadline: new Date('2026-06-15'), maxMarks: 100, type: 'file', createdBy: createdUsers.find(u => u.role === 'teacher')._id },
      { courseId: physicsCourse._id, title: 'Physics Lab Report', description: 'Write a lab report on quantum entanglement', deadline: new Date('2026-06-20'), maxMarks: 50, type: 'text', createdBy: createdUsers.find(u => u.role === 'teacher')._id },
      { courseId: englishCourse._id, title: 'Shakespeare Essay', description: 'Write a 2000 word essay on Hamlet', deadline: new Date('2026-05-10'), maxMarks: 100, type: 'text', createdBy: createdUsers.find(u => u.role === 'teacher')._id },
    ]);
    console.log('Created assignments');

    // Create submissions
    await Submission.insertMany([
      { assignmentId: assignments[1]._id, studentId: studentArjun._id, content: 'Lab report content...', status: 'submitted' },
      { assignmentId: assignments[2]._id, studentId: studentArjun._id, content: 'Shakespeare essay content...', grade: 88, feedback: 'Excellent analysis!', status: 'graded' },
    ]);
    console.log('Created submissions');

    // Create attendance
    const attendanceRecords = [];
    for (let day = 1; day <= 30; day++) {
      const date = new Date(2026, 4, day);
      const dayOfWeek = date.getDay();
      let status = 'present';
      let reason = '';
      if (dayOfWeek === 0) { status = 'holiday'; }
      else if (day % 5 === 0) { status = 'absent'; reason = 'Medical appointment'; }
      else if (day % 7 === 0) { status = 'leave'; reason = 'Family function'; }
      attendanceRecords.push({ studentId: studentArjun._id, date, status, reason });
    }
    await Attendance.insertMany(attendanceRecords);
    console.log('Created attendance records');

    // Create certificates
    await Certificate.insertMany([
      { studentId: studentArjun._id, courseId: englishCourse._id, grade: 'A', creditPoints: 0, instructor: 'Ms. Singh' },
      { studentId: studentArjun._id, courseId: envCourse._id, grade: 'A-', creditPoints: 3, instructor: 'Dr. Gupta' },
    ]);
    console.log('Created certificates');

    // Create trophies
    await Trophy.insertMany([
      { studentId: studentArjun._id, badgeType: 'achievement', title: 'First Course Complete', description: 'Completed your first course!', icon: '🏆' },
      { studentId: studentArjun._id, badgeType: 'attendance', title: 'Perfect Attendance - April', description: '100% attendance in April 2026', icon: '⭐' },
      { studentId: studentArjun._id, badgeType: 'academic', title: 'Top 3 in Class', description: 'Ranked 2nd in Class 10A mid-term exams', icon: '🥈' },
      { studentId: studentArjun._id, badgeType: 'achievement', title: '5 Certificates Earned', description: 'Completed 5 courses', icon: '🎓' },
    ]);
    console.log('Created trophies');

    console.log('\n✅ Seed completed successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
