import { Component, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AuthLayout from './components/layout/AuthLayout';
import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';

import AuthLanding from './pages/auth/AuthLanding';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyCertificate from './pages/public/VerifyCertificate';

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
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const StudentList = lazy(() => import('./pages/admin/StudentList'));
const StudentDetailAdmin = lazy(() => import('./pages/admin/StudentDetailAdmin'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const CallModule = lazy(() => import('./pages/admin/CallModule'));
const TeacherProfile = lazy(() => import('./pages/admin/TeacherProfile'));
const ManageCourses = lazy(() => import('./pages/admin/ManageCourses'));
const ManageAssignments = lazy(() => import('./pages/admin/ManageAssignments'));
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

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Suspense fallback={
              <div className="min-h-screen theme-bg flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm theme-text-muted">Loading...</p>
                </div>
              </div>
            }>
            <Routes>
              <Route path="/verify" element={<VerifyCertificate />} />
              <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
              <Route element={<AuthLayout />}>
                <Route path="/auth" element={<AuthLanding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Route>

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
                <Route path="certificates" element={<Certificates />} />
                <Route path="trophies" element={<TrophySession />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="knowledge-hub" element={<KnowledgeHub />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="students" element={<StudentList />} />
                <Route path="students/:id" element={<StudentDetailAdmin />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="calls" element={<CallModule />} />
                <Route path="profile" element={<TeacherProfile />} />
                <Route path="courses" element={<ManageCourses />} />
                <Route path="assignments" element={<ManageAssignments />} />
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
