import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Sidebar from './components/Sidebar';
import Login from './Login';
import Dashboard from './pages/Dashboard';
import ViewTicket from './pages/ViewTicket/ViewTicket';
import ViewAllContacts from './pages/ViewTicket/ViewAllContacts/ViewAllContacts';
import ViewAllTickets from './pages/ViewTicket/ViewAllTicket/ViewAllTickets';
import TrackActivities from './pages/TrackActivity/TrackActivities';
import Memberships from './pages/Allmember/Memberships';
import RevenuesReport from './pages/RevenueReport/RevenuesReport';
import ManageCourses from './pages/ManageCourses';
import ManageInstructor from './pages/ManageInstructor';
import ManageStudent from './pages/ManageStudent';
import CreateCourse from './components/Instructor_createCourse_component/createCourse';
import CourseEditor from './components/Instructor_createCourse_component/courseEditor';
import InstructorActivity from './pages/TrackActivity/InstructorActivity/InstructorActivity';
import StudentActivity from './pages/TrackActivity/StudentActivity/StudentActivity';
import Setting from './pages/setting';

import { Menu } from 'lucide-react';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMenuButton, setShowMenuButton] = useState(true);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const isLoginPage = location.pathname === '/login';
  const showSidebar = isAuthenticated && !isLoginPage;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {showSidebar && (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 shadow-lg bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center justify-between p-2">
            <h1 className="text-xl font-bold">LMS</h1>
            {showMenuButton && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 bg-gray-200 rounded shadow-md"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>
      )}

      <div className={`flex flex-1 ${showSidebar ? 'lg:pt-0 pt-10' : 'pt-0'}`}>        
        {showSidebar && (
          <>
            <aside
              className={`fixed ${showSidebar ? 'lg:top-0 top-10' : 'top-0'} left-0 h-[98vh] lg:h-[100vh] w-64 z-40 shadow-lg border-r transform transition-transform duration-300
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
              bg-white dark:bg-gray-800 text-black dark:text-white`}
            >
              <Sidebar onLinkClick={() => setSidebarOpen(false)} />
            </aside>
            {sidebarOpen && (
              <div
                className="fixed inset-0 top-10 z-30 backdrop-blur-sm bg-transparent lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </>
        )}

        <main className={`flex-1 ${showSidebar ? 'lg:ml-64' : 'ml-0'} overflow-x-auto`}>          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            <Route path="/manage-courses" element={<ProtectedRoute><ManageCourses /></ProtectedRoute>} />
            <Route path="/track-activities" element={<ProtectedRoute><TrackActivities /></ProtectedRoute>} />
            <Route path="/instructor-activity" element={<ProtectedRoute><InstructorActivity /></ProtectedRoute>} />
            <Route path="/student-activity" element={<ProtectedRoute><StudentActivity /></ProtectedRoute>} />
            <Route path="/ticket-contact" element={<ProtectedRoute><ViewTicket /></ProtectedRoute>} />
            <Route path="/ticket-contact/all-contacts" element={<ProtectedRoute><ViewAllContacts /></ProtectedRoute>} />
            <Route path="/ticket-contact/all-tickets" element={<ProtectedRoute><ViewAllTickets /></ProtectedRoute>} />
            <Route path="/manage-instructor" element={<ProtectedRoute><ManageInstructor /></ProtectedRoute>} />
            <Route path="/manage-student" element={<ProtectedRoute><ManageStudent /></ProtectedRoute>} />
            <Route path="/dashboard/create-course" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
            <Route path="/dashboard/course-editor/:courseId" element={<ProtectedRoute><CourseEditor /></ProtectedRoute>} />
            <Route path="/memberships" element={<ProtectedRoute><Memberships /></ProtectedRoute>} />
            <Route path="/revenues-report" element={<ProtectedRoute><RevenuesReport /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Setting /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;