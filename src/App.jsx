import { Component, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AuthLayout from './components/layout/AuthLayout';
import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';
import ParentLayout from './components/layout/ParentLayout';

// Auth pages
import AuthLanding from './pages/auth/AuthLanding';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyCertificate from './pages/public/VerifyCertificate';

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const CourseCatalog = lazy(() => import('./pages/student/CourseCatalog'));
const LearningPage = lazy(() => import('./pages/student/LearningPage'));
const Assignments = lazy(() => import('./pages/student/Assignments'));
const Certificates = lazy(() => import('./pages/student/Certificates'));
const TrophySession = lazy(() => import('./pages/student/TrophySession'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const Attendance = lazy(() => import('./pages/student/Attendance'));
const Leaderboard = lazy(() => import('./pages/student/Leaderboard'));
const KnowledgeHub = lazy(() => import('./pages/student/KnowledgeHub'));
const Schedule = lazy(() => import('./pages/student/Schedule'));
const QuizList = lazy(() => import('./pages/student/QuizList'));
const QuizTake = lazy(() => import('./pages/student/QuizTake'));
const Achievements = lazy(() => import('./pages/student/Achievements'));
const Skills = lazy(() => import('./pages/student/Skills'));
const StudyPlan = lazy(() => import('./pages/student/StudyPlan'));
const StudentAnalytics = lazy(() => import('./pages/student/StudentAnalytics'));
const Planner = lazy(() => import('./pages/student/Planner'));
const Projects = lazy(() => import('./pages/student/Projects'));
const Career = lazy(() => import('./pages/student/Career'));
const Coding = lazy(() => import('./pages/student/Coding'));
const Interviews = lazy(() => import('./pages/student/Interviews'));

// Recruiter pages
const RecruiterDashboard = lazy(() => import('./pages/recruiter/RecruiterDashboard'));
const RecruiterJobs = lazy(() => import('./pages/recruiter/RecruiterJobs'));
const RecruiterApplications = lazy(() => import('./pages/recruiter/RecruiterApplications'));
const RecruiterApplicationDetail = lazy(() => import('./pages/recruiter/RecruiterApplicationDetail'));
const RecruiterCandidates = lazy(() => import('./pages/recruiter/RecruiterCandidates'));
const RecruiterProfile = lazy(() => import('./pages/recruiter/RecruiterProfile'));

// Teacher pages
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));
const ManageCourses = lazy(() => import('./pages/teacher/ManageCourses'));
const CourseBuilder = lazy(() => import('./pages/teacher/CourseBuilder'));
const ManageAssignments = lazy(() => import('./pages/teacher/ManageAssignments'));
const ManageQuizzes = lazy(() => import('./pages/teacher/ManageQuizzes'));
const GradeBook = lazy(() => import('./pages/teacher/GradeBook'));
const StudentAnalyticsTeacher = lazy(() => import('./pages/teacher/StudentAnalytics'));
const TeacherResources = lazy(() => import('./pages/teacher/TeacherResources'));
const TeacherProfile = lazy(() => import('./pages/teacher/TeacherProfile'));
const TeacherAttendance = lazy(() => import('./pages/teacher/TeacherAttendance'));
const TeacherMessages = lazy(() => import('./pages/teacher/TeacherMessages'));

// Parent pages
const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard'));
const ParentAttendance = lazy(() => import('./pages/parent/ParentAttendance'));
const ParentPerformance = lazy(() => import('./pages/parent/ParentPerformance'));
const ParentAssignments = lazy(() => import('./pages/parent/ParentAssignments'));
const ParentReports = lazy(() => import('./pages/parent/ParentReports'));
const ParentMessages = lazy(() => import('./pages/parent/ParentMessages'));
const ParentNotifications = lazy(() => import('./pages/parent/ParentNotifications'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const StudentList = lazy(() => import('./pages/admin/StudentList'));
const StudentDetailAdmin = lazy(() => import('./pages/admin/StudentDetailAdmin'));
const TeacherList = lazy(() => import('./pages/admin/TeacherList'));
const ParentList = lazy(() => import('./pages/admin/ParentList'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminCertificates = lazy(() => import('./pages/admin/AdminCertificates'));
const DepartmentManagement = lazy(() => import('./pages/admin/DepartmentManagement'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const AdminRecruiters = lazy(() => import('./pages/admin/AdminRecruiters'));
const AdminJobs = lazy(() => import('./pages/admin/AdminJobs'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const DatabaseHealth = lazy(() => import('./pages/admin/DatabaseHealth'));

// Shared pages
const Messages = lazy(() => import('./pages/shared/Messages'));
const Notifications = lazy(() => import('./pages/shared/Notifications'));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen theme-bg flex items-center justify-center p-4">
          <div className="theme-card border border-red-500/20 rounded-2xl p-8 max-w-lg w-full text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <h1 className="text-lg font-semibold theme-text mb-2">Something went wrong</h1>
            <p className="text-sm theme-text-muted mb-4 font-mono break-all">{this.state.error.message}</p>
            <button onClick={() => { this.setState({ error: null }); window.location.href = '/login'; }} className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors">Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingSpinner = () => (
  <div className="min-h-screen theme-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm theme-text-muted">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/verify/:certificateId" element={<VerifyCertificate />} />

              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/auth" element={<AuthLanding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

              {/* Student routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="courses" element={<CourseCatalog />} />
                <Route path="learning/:courseId" element={<LearningPage />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="quizzes" element={<QuizList />} />
                <Route path="quizzes/:quizId" element={<QuizTake />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="achievements" element={<Achievements />} />
                <Route path="skills" element={<Skills />} />
                <Route path="knowledge-hub" element={<KnowledgeHub />} />
                <Route path="trophies" element={<TrophySession />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="study-plan" element={<StudyPlan />} />
                <Route path="planner" element={<Planner />} />
                <Route path="projects" element={<Projects />} />
                <Route path="career" element={<Career />} />
                <Route path="coding" element={<Coding />} />
                <Route path="interviews" element={<Interviews />} />
                <Route path="my-analytics" element={<StudentAnalytics />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              {/* Teacher routes */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/teacher/dashboard" replace />} />
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="courses" element={<ManageCourses />} />
                <Route path="courses/:courseId" element={<CourseBuilder />} />
                <Route path="assignments" element={<ManageAssignments />} />
                <Route path="quizzes" element={<ManageQuizzes />} />
                <Route path="gradebook" element={<GradeBook />} />
                <Route path="gradebook/:courseId" element={<GradeBook />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="students" element={<StudentAnalyticsTeacher />} />
                <Route path="resources" element={<TeacherResources />} />
                <Route path="profile" element={<TeacherProfile />} />
                <Route path="messages" element={<TeacherMessages />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              {/* Parent routes */}
              <Route
                path="/parent"
                element={
                  <ProtectedRoute allowedRoles={['parent']}>
                    <ParentLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/parent/dashboard" replace />} />
                <Route path="dashboard" element={<ParentDashboard />} />
                <Route path="attendance" element={<ParentAttendance />} />
                <Route path="performance" element={<ParentPerformance />} />
                <Route path="assignments" element={<ParentAssignments />} />
                <Route path="reports" element={<ParentReports />} />
                <Route path="messages" element={<ParentMessages />} />
                <Route path="notifications" element={<ParentNotifications />} />
              </Route>

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<StudentList />} />
                <Route path="students/:id" element={<StudentDetailAdmin />} />
                <Route path="teachers" element={<TeacherList />} />
                <Route path="parents" element={<ParentList />} />
                <Route path="recruiters" element={<AdminRecruiters />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="certificates" element={<AdminCertificates />} />
                <Route path="departments" element={<DepartmentManagement />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="health" element={<DatabaseHealth />} />
                <Route path="profile" element={<TeacherProfile />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              {/* Recruiter routes */}
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
                <Route path="dashboard" element={<RecruiterDashboard />} />
                <Route path="jobs" element={<RecruiterJobs />} />
                <Route path="applications" element={<RecruiterApplications />} />
                <Route path="applications/:id" element={<RecruiterApplicationDetail />} />
                <Route path="candidates" element={<RecruiterCandidates />} />
                <Route path="profile" element={<RecruiterProfile />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                borderRadius: '12px',
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;