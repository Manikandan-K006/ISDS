import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AuthLayout from './components/layout/AuthLayout';
import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import StudentDashboard from './pages/student/StudentDashboard';
import CourseCatalog from './pages/student/CourseCatalog';
import LearningPage from './pages/student/LearningPage';
import Assignments from './pages/student/Assignments';
import Certificates from './pages/student/Certificates';
import TrophySession from './pages/student/TrophySession';
import StudentProfile from './pages/student/StudentProfile';
import Attendance from './pages/student/Attendance';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentList from './pages/admin/StudentList';
import StudentDetailAdmin from './pages/admin/StudentDetailAdmin';
import Analytics from './pages/admin/Analytics';
import CallModule from './pages/admin/CallModule';
import TeacherProfile from './pages/admin/TeacherProfile';
import ManageCourses from './pages/admin/ManageCourses';
import ManageAssignments from './pages/admin/ManageAssignments';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
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
            <Route path="profile" element={<StudentProfile />} />
            <Route path="attendance" element={<Attendance />} />
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
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' },
        }}
      />
    </AuthProvider>
  );
}

export default App;
