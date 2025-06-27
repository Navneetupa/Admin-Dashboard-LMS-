import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loading from '../../Loading';

export default function InstructorActivity() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Newest');
  const token = localStorage.getItem('authToken');

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSearch = debounce((value) => setSearch(value), 300);

  const formatDate = (dateString) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const axiosInstance = axios.create({
          baseURL: 'https://lms-backend-flwq.onrender.com/api/v1/admin/analytics',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const response = await axiosInstance.get(`/instructor-activity?limit=100`);
        const data = response.data.data.map((inst) => ({
          id: inst._id,
          name: `${inst.instructor.firstName} ${inst.instructor.lastName}`,
          email: inst.instructor.email,
          course: inst.title,
          createdAt: inst.createdAt,
        }));

        setInstructors(data);
        setLoading(false);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            (error.response?.status === 401
              ? 'Unauthorized: Please check your token or log in again.'
              : 'Failed to fetch data.')
        );
        setLoading(false);
      }
    };

    if (token) fetchData();
    else {
      setError('No authentication token found.');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const sorted = [...instructors].sort((a, b) =>
      sort === 'Newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
    setInstructors(sorted);
  }, [sort]);

  const filtered = instructors.filter((inst) =>
    [inst.name, inst.email, inst.id].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <Loading />;
  if (error)
    return (
      <div
        className="p-6 min-h-screen text-red-600 dark:text-red-400"
        style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
      >
        {error}
      </div>
    );

  return (
    <div
      className="p-6 min-h-screen font-sans"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
    >
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/track-activities"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded bg-[var(--button-color)] text-white hover:opacity-90"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-bold">Instructor Activity</h1>
      </div>

      <section
        className="p-4 rounded-xl shadow"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-[var(--button-color)]">Instructors</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search name, email, or ID"
              className="px-3 py-1 border rounded border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1 border rounded border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No instructors found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700 text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">ID</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Course</th>
                  <th className="p-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst) => (
                  <tr
                    key={inst.id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <td className="p-2">{inst.name}</td>
                    <td className="p-2">{inst.id}</td>
                    <td className="p-2">{inst.email}</td>
                    <td className="p-2">{inst.course}</td>
                    <td className="p-2">{formatDate(inst.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
