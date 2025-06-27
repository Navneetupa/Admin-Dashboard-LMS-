// src/pages/TrackActivity/Activities.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Loading from "../Loading";
import { FaChalkboardTeacher, FaUserGraduate } from 'react-icons/fa';

export default function Activities() {
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [instructorSearch, setInstructorSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [instructorSort, setInstructorSort] = useState("Newest");
  const [studentSort, setStudentSort] = useState("Newest");
  const [limit] = useState(5);

  const token = localStorage.getItem("authToken");

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateString));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const axiosInstance = axios.create({
          baseURL: "https://lms-backend-flwq.onrender.com/api/v1/admin/analytics",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const instructorResponse = await axiosInstance.get(`/instructor-activity?limit=${limit}`);
        const instructorData = instructorResponse.data.data.slice(0, 5);

        const studentResponse = await axiosInstance.get(`/student-activity?limit=${limit}`);
        const studentData = studentResponse.data.data.slice(0, 5);

        const mappedInstructors = instructorData.map((inst) => ({
          id: inst._id,
          name: `${inst.instructor.firstName} ${inst.instructor.lastName}`,
          email: inst.instructor.email,
          course: inst.title,
          createdAt: inst.createdAt,
        }));

        const mappedStudents = studentData.map((stud) => ({
          id: stud._id,
          name: `${stud.student.firstName} ${stud.student.lastName}`,
          email: stud.student.email,
          assignment: stud.course ? stud.course.title : "No Course Assigned",
          createdAt: stud.createdAt || new Date().toISOString(),
        }));

        setInstructors(mappedInstructors);
        setStudents(mappedStudents);
        setLoading(false);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.status === 401
            ? "Unauthorized: Please check your token or log in again."
            : "Failed to fetch data. Please try again later.");
        setError(errorMessage);
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      setError("No authentication token found. Please log in.");
      setLoading(false);
    }
  }, [token, limit]);

  useEffect(() => {
    const sortedInstructors = [...instructors].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return instructorSort === "Newest" ? dateB - dateA : dateA - dateB;
    });

    const sortedStudents = [...students].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return studentSort === "Newest" ? dateB - dateA : dateA - dateB;
    });

    setInstructors(sortedInstructors);
    setStudents(sortedStudents);
  }, [instructorSort, studentSort]);

  const handleInstructorSearch = debounce((value) => {
    setInstructorSearch(value);
  }, 300);

  const handleStudentSearch = debounce((value) => {
    setStudentSearch(value);
  }, 300);

  const filteredInstructors = instructors.filter(
    (inst) =>
      inst.name.toLowerCase().includes(instructorSearch.toLowerCase()) ||
      inst.email.toLowerCase().includes(instructorSearch.toLowerCase()) ||
      inst.id.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  const filteredStudents = students.filter(
    (stud) =>
      stud.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      stud.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      stud.id.toLowerCase().includes(studentSearch.toLowerCase())
  );

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="p-4 md:p-8 min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen font-sans" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div className="flex flex-row justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold" style={{ color: 'var(--heading-color)' }}>Activities</h1>
        <div className="flex flex-row gap-2 sm:gap-4">
          <Link to="/instructor-activity" className="px-4 py-2 rounded text-white font-medium shadow" style={{ backgroundColor: 'var(--button-color)' }}>Instructor Activity</Link>
          <Link to="/student-activity" className="px-4 py-2 rounded text-white font-medium shadow" style={{ backgroundColor: 'var(--button-color)' }}>Student Activity</Link>
        </div>
      </div>

      <section className="p-4 md:p-6 rounded-2xl shadow mb-8" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--heading-color)' }}>Instructors</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <input className="px-3 py-1 rounded border w-full" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }} placeholder="Search by name, email, or ID" onChange={(e) => handleInstructorSearch(e.target.value)} />
            <select className="px-2 py-1 border rounded" value={instructorSort} onChange={(e) => setInstructorSort(e.target.value)} style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--text-color)', opacity: 0.8 }}>
                <th className="py-2 px-4">Name</th>
                <th className="px-4">ID</th>
                <th className="px-4">Email</th>
                <th className="px-4">Courses</th>
                <th className="px-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.map((inst) => (
                <tr key={inst.id} style={{ color: 'var(--text-color)' }}>
                  <td className="py-3 px-4">{inst.name}</td>
                  <td className="px-4">{inst.id}</td>
                  <td className="px-4">{inst.email}</td>
                  <td className="px-4">{inst.course}</td>
                  <td className="px-4">{formatDate(inst.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="p-4 md:p-6 rounded-2xl shadow" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--heading-color)' }}>Students</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <input className="px-3 py-1 rounded border w-full" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }} placeholder="Search by name, email, or ID" onChange={(e) => handleStudentSearch(e.target.value)} />
            <select className="px-2 py-1 border rounded" value={studentSort} onChange={(e) => setStudentSort(e.target.value)} style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)' }}>
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--text-color)', opacity: 0.8 }}>
                <th className="py-2 px-4">Name</th>
                <th className="px-4">ID</th>
                <th className="px-4">Email</th>
                <th className="px-4">Assignment</th>
                <th className="px-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((stud) => (
                <tr key={stud.id} style={{ color: 'var(--text-color)' }}>
                  <td className="py-3 px-4">{stud.name}</td>
                  <td className="px-4">{stud.id}</td>
                  <td className="px-4">{stud.email}</td>
                  <td className="px-4">{stud.assignment}</td>
                  <td className="px-4">{formatDate(stud.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
