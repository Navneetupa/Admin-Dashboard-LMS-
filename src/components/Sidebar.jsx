import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaBook,
  FaChartLine,
  FaTicketAlt,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaCog,
  FaSignOutAlt,
  FaPlusCircle,
  FaBell, // ✅ Added for Notification
} from 'react-icons/fa';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function EnhancedSidebar({ onLinkClick }) {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.style.setProperty('--bg-color', '#1F2937');
      root.style.setProperty('--text-color', '#F3F4F6');
      root.style.setProperty('--card-bg', '#374151');
      root.style.setProperty('--border-color', '#4B5563');
      root.style.setProperty('--accent-color', '#3B82F6');
    } else {
      root.style.setProperty('--bg-color', '#F8FAFC');
      root.style.setProperty('--text-color', '#1F2937');
      root.style.setProperty('--card-bg', '#FFFFFF');
      root.style.setProperty('--border-color', '#D1D5DB');
      root.style.setProperty('--accent-color', '#2563EB');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const linkClass =
    'flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--accent-color)]/10 transition-all duration-300 ease-in-out group';
  const activeClass = 'font-semibold bg-[var(--accent-color)]/20 text-[var(--accent-color)]';

  const handleClick = () => {
    if (onLinkClick) onLinkClick();
  };

  const handleLogout = () => {
    logout();
    handleClick();
  };

  if (!user) return null;

  return (
    <div
      className="w-64 h-full flex flex-col rounded-2xl shadow-xl p-5 transition-all duration-300"
      style={{
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        minHeight: '100vh',
        maxHeight: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="text-2xl font-extrabold bg-gradient-to-r from-[var(--accent-color)] to-blue-400 bg-clip-text text-transparent">
          LMS
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-[var(--card-bg)] transition-all duration-200"
          title="Toggle Theme"
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1.5 flex-1">
        <NavLink to="/" end onClick={handleClick} className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}>
          <FaHome size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Dashboard</span>
        </NavLink>

       
        <NavLink to="/manage-courses" onClick={handleClick} className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}>
          <FaBook size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Manage Courses</span>
        </NavLink>

        <NavLink to="/track-activities" onClick={handleClick} className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}>
          <FaChartLine size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Track Activities</span>
        </NavLink>

        <NavLink to="/ticket-contact" onClick={handleClick} className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}>
          <FaTicketAlt size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Ticket & Contact</span>
        </NavLink>

        <NavLink to="/manage-instructor" onClick={handleClick} className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}>
          <FaChalkboardTeacher size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Manage Instructors</span>
        </NavLink>

        <NavLink to="/manage-student" onClick={handleClick} className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}>
          <FaUserGraduate size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Manage Students</span>
        </NavLink>

        <NavLink to="/dashboard/create-course" onClick={handleClick} className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}>
          <FaPlusCircle size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Create Course</span>
        </NavLink>
      </nav>

      {/* Bottom: Profile & Logout */}
      <div className="mt-8">
        <div className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-[var(--card-bg)] transition-all duration-200">
          <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="rounded-full w-12 h-12 object-cover ring-2 ring-[var(--accent-color)]/30" />
          <div>
            <p className="text-sm font-semibold">{`${user.firstName} ${user.lastName}`}</p>
            <span className="text-xs bg-[var(--accent-color)]/10 text-[var(--accent-color)] px-2 py-1 rounded-full">{user.role}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <NavLink to="/settings" onClick={handleClick} className={({ isActive }) => (isActive ? `${linkClass} ${activeClass}` : linkClass)}>
            <FaCog size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Settings</span>
          </NavLink>
          <NavLink to="/login" onClick={handleLogout} className={({ isActive }) => (isActive ? `${linkClass} ${activeClass} text-red-500` : `${linkClass} text-red-500`)}>
            <FaSignOutAlt size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">Log Out</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}