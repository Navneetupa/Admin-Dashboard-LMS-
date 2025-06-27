// src/components/Sidebar.jsx
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
} from 'react-icons/fa';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Sidebar({ onLinkClick }) {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.style.setProperty('--bg-color', '#1E1E2F');
      root.style.setProperty('--text-color', '#FFFFFF');
      root.style.setProperty('--card-bg', '#2E2E42');
      root.style.setProperty('--border-color', '#444');
    } else {
      root.style.setProperty('--bg-color', '#F9FAFB');
      root.style.setProperty('--text-color', '#111827');
      root.style.setProperty('--card-bg', '#FFFFFF');
      root.style.setProperty('--border-color', '#E5E7EB');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const linkClass =
    'flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 ease-in-out';
  const activeClass = 'font-semibold';

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
      className="w-64 border-r h-full flex flex-col justify-between rounded-xl shadow-lg p-4 border-none"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      <div>
        <div className="flex items-center justify-between pl-[1rem] pr-2 mb-8">
          <div className="text-xl font-bold clr">LMS</div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <nav className="space-y-2">
          <NavLink to="/" end onClick={handleClick}
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}>
            <FaHome size={18} /> Dashboard
          </NavLink>
          <NavLink to="/manage-courses" onClick={handleClick}
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}>
            <FaBook size={18} /> Manage Courses
          </NavLink>
          <NavLink to="/track-activities" onClick={handleClick}
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}>
            <FaChartLine size={18} /> Track Activities
          </NavLink>
          <NavLink to="/ticket-contact" onClick={handleClick}
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}>
            <FaTicketAlt size={18} /> Ticket & Contact
          </NavLink>
          <NavLink to="/manage-instructor" onClick={handleClick}
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}>
            <FaChalkboardTeacher size={18} /> Manage Instructors
          </NavLink>
          <NavLink to="/manage-student" onClick={handleClick}
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}>
            <FaUserGraduate size={18} /> Manage Student
          </NavLink>
          <NavLink to="/dashboard/create-course" onClick={handleClick}
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}>
            <FaPlusCircle size={18} /> Create Course
          </NavLink>
        </nav>
      </div>

      <div className="mt-10">
        <div className="flex items-center space-x-3 mb-2">
          <img
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            className="rounded-full w-10 h-10 object-cover"
          />
          <div>
            <p className="text-sm font-semibold">{user.firstName}</p>
            <span className="text-xs bg-green-100 text-green-800 px-2 rounded-md">
              {user.role}
            </span>
          </div>
        </div>
        <div>
          <NavLink to="/settings" onClick={handleClick}
            className={({ isActive }) => isActive ? `${linkClass} ${activeClass}` : linkClass}>
            <FaCog size={16} /> Settings
          </NavLink>
          <NavLink to="/login" onClick={handleLogout}
            className={({ isActive }) =>
              isActive ? `${linkClass} ${activeClass} text-red-400` : `${linkClass} text-red-400`
            }>
            <FaSignOutAlt size={16} /> Log out
          </NavLink>
        </div>
      </div>
    </div>
  );
}
