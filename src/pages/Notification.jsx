import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import axios from 'axios';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [notificationType, setNotificationType] = useState('user');
  const [newNotification, setNewNotification] = useState({
    userIds: [],
    courseId: '',
    title: '',
    message: '',
    type: 'course',
    relatedEntity: '',
    relatedEntityModel: '',
    actionUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();

    // Mock data (Replace with API)
    setStudents([
      { id: '1', firstName: 'Aman', lastName: 'Verma', email: 'aman@example.com' },
      { id: '2', firstName: 'Pooja', lastName: 'Sharma', email: 'pooja@example.com' }
    ]);

    setCourses([
      { _id: 'course1', title: 'React Basics' },
      { _id: 'course2', title: 'Advanced JS' }
    ]);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:6600/api/notifications');
      setNotifications(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch notifications');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotification((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (e) => {
    const { value, checked } = e.target;
    if (value === 'all') {
      setNewNotification((prev) => ({
        ...prev,
        userIds: checked ? students.map((s) => s.id) : []
      }));
    } else {
      setNewNotification((prev) => ({
        ...prev,
        userIds: checked
          ? [...(prev.userIds || []), value]
          : (prev.userIds || []).filter((id) => id !== value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...newNotification,
        user: '6819e09cc2c88d511699fdb9',
        relatedEntityModel: notificationType === 'user' ? '' : 'Course'
      };

      const response = await axios.post('http://localhost:6600/api/notifications', payload);
      setNotifications([response.data, ...notifications]);
      setNewNotification({
        userIds: [],
        courseId: '',
        title: '',
        message: '',
        type: 'course',
        relatedEntity: '',
        relatedEntityModel: '',
        actionUrl: ''
      });
      setShowModal(false);
      setLoading(false);
    } catch (err) {
      setError('Failed to create notification');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaBell className="text-[var(--accent-color)]" /> Notifications
      </h1>

      <button
        className="mb-6 px-4 py-2 bg-[var(--accent-color)] text-white rounded hover:bg-[var(--accent-color)]/80"
        onClick={() => setShowModal(true)}
      >
        Drop Message
      </button>

      <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Recent Notifications</h2>
        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications found.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li key={notification._id} className="border-b border-[var(--border-color)] pb-4">
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-sm">{notification.message}</p>
                <p className="text-xs text-gray-500">Type: {notification.type}</p>
                {notification.actionUrl && (
                  <a
                    href={notification.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent-color)] text-sm hover:underline"
                  >
                    View Details
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-start justify-center pt-20 px-4">
          <div className="bg-[var(--card-bg)] text-[var(--text-color)] rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-2">Send Notification</h2>

            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setNotificationType('user')}
                className={`flex-1 p-2 rounded ${
                  notificationType === 'user'
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--bg-color)] border border-[var(--border-color)]'
                }`}
              >
                To Users
              </button>
              <button
                onClick={() => setNotificationType('course')}
                className={`flex-1 p-2 rounded ${
                  notificationType === 'course'
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--bg-color)] border border-[var(--border-color)]'
                }`}
              >
                Course Notification
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {notificationType === 'user' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-sm font-medium">Select Users</label>
                    <div className="max-h-40 overflow-y-auto border p-3 rounded border-[var(--border-color)] bg-[var(--bg-color)]">
                      <label className="flex items-center mb-2 gap-2 text-sm">
                        <input
                          type="checkbox"
                          value="all"
                          checked={newNotification.userIds?.length === students.length}
                          onChange={handleUserSelect}
                        />
                        All Users
                      </label>
                      {students.map((student) => (
                        <label key={student.id} className="flex items-center gap-2 text-sm mb-1">
                          <input
                            type="checkbox"
                            value={student.id}
                            checked={newNotification.userIds?.includes(student.id)}
                            onChange={handleUserSelect}
                          />
                          {student.firstName} {student.lastName} ({student.email})
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block mb-1 text-sm font-medium">Select Course</label>
                  <select
                    name="courseId"
                    value={newNotification.courseId}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded border border-[var(--border-color)] bg-[var(--bg-color)]"
                    required
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newNotification.title}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded border border-[var(--border-color)] bg-[var(--bg-color)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  name="message"
                  value={newNotification.message}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 rounded border border-[var(--border-color)] bg-[var(--bg-color)]"
                  required
                ></textarea>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    name="type"
                    value={newNotification.type}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded border border-[var(--border-color)] bg-[var(--bg-color)]"
                  >
                    <option value="course">Course</option>
                    <option value="general">General</option>
                    <option value="update">Update</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Action URL</label>
                  <input
                    type="text"
                    name="actionUrl"
                    value={newNotification.actionUrl}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded border border-[var(--border-color)] bg-[var(--bg-color)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[var(--accent-color)] text-white rounded hover:bg-opacity-80 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
