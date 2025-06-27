// src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loading from "../pages/Loading";


const Card = ({ children }) => (
  <div
    className="rounded-xl p-6 shadow-md transition"
    style={{
      backgroundColor: "var(--card-bg)",
      color: "var(--text-color)",
      border: "1px solid var(--border-color)",
    }}
  >
    {children}
  </div>
);

const InfoCard = ({ title, value, link, to }) => (
  <Card>
    <h3 className="text-sm font-medium opacity-80 mb-1">{title}</h3>
    <div className="text-3xl font-bold mb-2">{value}</div>
    <Link to={to} className="text-sm text-[#49BBBD] font-medium hover:underline">
      {link} →
    </Link>
  </Card>
);

const UserList = ({ title, users }) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        openMenuId &&
        menuRefs.current[openMenuId] &&
        !menuRefs.current[openMenuId].contains(e.target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ul className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
        {users.length === 0 ? (
          <p className="text-sm opacity-60">No {title.toLowerCase()} found.</p>
        ) : (
          users.map((user) => (
            <li
              key={user._id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    user.avatar ||
                    "https://res.cloudinary.com/dcgilmdbm/image/upload/v1747893719/default_avatar_xpw8jv.jpg"
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-sm">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs opacity-70">
                    {user.company || user.school || user.role}
                  </div>
                </div>
              </div>
              <div className="relative">
                <MoreVertical
                  className="cursor-pointer text-gray-500"
                  size={16}
                  onClick={() =>
                    setOpenMenuId(openMenuId === user._id ? null : user._id)
                  }
                />
                {openMenuId === user._id && (
                  <div
                    ref={(el) => (menuRefs.current[user._id] = el)}
                    className="absolute right-0 top-full mt-2 w-64 z-50 rounded-md shadow-lg border p-4"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      color: "var(--text-color)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <h4 className="font-semibold text-sm mb-2">User Details</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>ID:</strong> {user._id}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Role:</strong> {user.role}</p>
                      {user.company && <p><strong>Company:</strong> {user.company}</p>}
                      {user.school && <p><strong>School:</strong> {user.school}</p>}
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
      <div className="mt-4 text-right">
        <Link
          to={title === "Instructors" ? "/manage-instructor" : "/manage-student"}
          className="inline-block px-4 py-1 text-sm text-white bg-[#49BBBD] rounded hover:bg-teal-600 transition"
        >
          Manage {title}
        </Link>
      </div>
    </Card>
  );
};

export default function Dashboard() {
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const axiosInstance = axios.create({
          baseURL: "https://lms-backend-flwq.onrender.com/api/v1/admin",
          headers: { Authorization: `Bearer ${token}` },
        });

        const instructorRes = await axiosInstance.get(`/users/instructors?limit=6`);
        const studentRes = await axiosInstance.get(`/users/students?limit=6`);
        const revenueRes = await axiosInstance.get("/analytics/revenue");
        const enrollmentRes = await axiosInstance.get("/analytics/total-enrollments");

        setInstructors(instructorRes.data.data);
        setStudents(studentRes.data.data);
        setTotalRevenue(revenueRes.data.data.totalRevenue || 0);
        setTotalEnrollments(enrollmentRes.data.data.totalEnrollments || 0);
        setLoading(false);
      } catch (err) {
        setError("Something went wrong fetching data.");
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div
      className="p-6 min-h-screen"
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 mt-4">
        <InfoCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          link="Revenue Report"
          to="/revenues-report"
        />
        <InfoCard
          title="Total Enrollments"
          value={totalEnrollments.toLocaleString()}
          link="All Enrollments"
          to="/memberships"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserList title="Instructors" users={instructors} />
        <UserList title="Students" users={students} />
      </div>
    </div>
  );
}
