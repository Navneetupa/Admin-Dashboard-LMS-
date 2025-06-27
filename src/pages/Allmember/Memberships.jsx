import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading";

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [filteredMemberships, setFilteredMemberships] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        setLoading(true);
        const axiosInstance = axios.create({
          baseURL: "https://lms-backend-flwq.onrender.com/api/v1/admin",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const response = await axiosInstance.get("/analytics/enrollments");
        const mapped = response.data.data.map((e) => ({
          id: e._id,
          studentName: e.studentName,
          studentId: e.studentId,
          studentEmail: e.studentEmail,
          courseTitle: e.courseTitle,
        }));
        setMemberships(mapped);
        setFilteredMemberships(mapped);
        setLoading(false);
      } catch (err) {
        const msg =
          err.response?.status === 401
            ? "Unauthorized: Please log in again."
            : err.response?.status === 404
            ? "Membership data not found."
            : "Failed to fetch memberships. Please try again later.";
        setError(msg);
        setLoading(false);
      }
    };

    if (token) fetchMemberships();
    else {
      setError("No authentication token found. Please log in.");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const filtered = memberships.filter((m) =>
      [m.studentName, m.studentEmail, m.courseTitle].some((f) =>
        f?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    );
    setFilteredMemberships(filtered);
  }, [debouncedSearchQuery, memberships]);

  if (loading) return <Loading />;
  if (error)
    return (
      <div
        className="p-6 text-center text-red-600"
        style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
      >
        {error}
      </div>
    );

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#49BBBD] text-white font-bold rounded hover:opacity-90 transition"
          >
            Back
          </button>
          <h1 className="text-2xl font-bold">All Enrollments</h1>
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or course..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#49BBBD] text-black dark:text-white dark:bg-gray-800"
        />
      </div>

      <p className="mb-6 text-gray-600 dark:text-gray-300 text-center">
        View enrollment details for your courses.
      </p>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <div
          className="rounded-xl shadow-md p-4"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-3 border-b">Student Name</th>
                <th className="p-3 border-b">Student ID</th>
                <th className="p-3 border-b">Student Email</th>
                <th className="p-3 border-b">Course Title</th>
              </tr>
            </thead>
            <tbody>
              {filteredMemberships.length > 0 ? (
                filteredMemberships.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 border-b"
                  >
                    <td className="p-3">{m.studentName || "N/A"}</td>
                    <td className="p-3">{m.studentId || "N/A"}</td>
                    <td className="p-3">{m.studentEmail || "N/A"}</td>
                    <td className="p-3">{m.courseTitle || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet View */}
      <div className="hidden sm:block lg:hidden grid sm:grid-cols-2 gap-4 mt-6">
        {filteredMemberships.length > 0 ? (
          filteredMemberships.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-lg shadow-md"
              style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
              }}
            >
              <h2 className="text-lg font-semibold mb-2">{m.courseTitle || "N/A"}</h2>
              <p className="mb-1">
                <span className="font-bold">Name:</span> {m.studentName || "N/A"}
              </p>
              <p className="mb-1">
                <span className="font-bold">ID:</span> {m.studentId || "N/A"}
              </p>
              <p className="mb-1">
                <span className="font-bold">Email:</span> {m.studentEmail || "N/A"}
              </p>
            </div>
          ))
        ) : (
          <div className="p-4 col-span-2 text-center text-gray-500 rounded-lg border">
            No enrollments found.
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="sm:hidden mt-6 grid gap-4">
        {filteredMemberships.length > 0 ? (
          filteredMemberships.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-lg shadow-md"
              style={{
                backgroundColor: "var(--card-bg)",
                color: "var(--text-color)",
                border: "1px solid var(--border-color)",
              }}
            >
              <h2 className="text-lg font-semibold mb-2">{m.courseTitle || "N/A"}</h2>
              <p className="mb-1">
                <span className="font-bold">Name:</span> {m.studentName || "N/A"}
              </p>
              <p className="mb-1">
                <span className="font-bold">ID:</span> {m.studentId || "N/A"}
              </p>
              <p className="mb-1">
                <span className="font-bold">Email:</span> {m.studentEmail || "N/A"}
              </p>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 border rounded-lg">
            No enrollments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Memberships;
