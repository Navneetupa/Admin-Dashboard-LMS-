import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Loading from "./Loading";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaBriefcase,
  FaCode,
  FaHeart,
  FaCheckCircle,
  FaShieldAlt,
  FaCalendarAlt,
  FaSignInAlt,
  FaCog,
} from "react-icons/fa";

const ManageStudent = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    education: "",
    occupation: "",
    skills: "",
    interests: "",
  });
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        if (!token) {
          throw new Error("No authentication token found");
        }
        const response = await axios.get(
          "https://lms-backend-flwq.onrender.com/api/v1/admin/users/students",
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );
        if (response.data.success && Array.isArray(response.data.data)) {
          setStudents(response.data.data);
        } else {
          setError("Failed to fetch students: Invalid response data");
        }
      } catch (err) {
        console.error("Fetch students error:", err);
        setError(
          err.response?.data?.message ||
            `Error fetching students: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStudents();
    } else {
      setError("Please log in to fetch students");
      setLoading(false);
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!formData.password || formData.password.length < 6) {
      setModalError("Password is required and must be at least 6 characters long");
      return;
    }

    const newStudent = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      education: formData.education,
      occupation: formData.occupation,
      skills: formData.skills
        ? formData.skills.split(",").map((item) => item.trim())
        : [],
      interests: formData.interests
        ? formData.interests.split(",").map((item) => item.trim())
        : [],
    };

    try {
      const response = await axios.post(
        "https://lms-backend-flwq.onrender.com/api/v1/admin/users/students",
        newStudent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      if (response.data.success && response.data.data) {
        setStudents([response.data.data, ...students]);
        setIsModalOpen(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phone: "",
          education: "",
          occupation: "",
          skills: "",
          interests: "",
        });
        setSearchQuery("");
        setModalError("");
      } else {
        setModalError("Failed to enroll student: Invalid response data");
      }
    } catch (err) {
      console.error("Enroll student error:", err);
      setModalError(
        err.response?.data?.message || `Error enrolling student: ${err.message}`
      );
    }
  };

  const handleToggleStatus = async (studentId) => {
    const student = students.find((s) => s._id === studentId);
    if (!student) {
      setError("Student not found");
      return;
    }

    const newStatus = !student.isActive;
    setToggleLoading((prev) => ({ ...prev, [studentId]: true }));
    setError("");

    try {
      const response = await axios.patch(
        `https://lms-backend-flwq.onrender.com/api/v1/admin/users/students/${studentId}/toggle-active`,
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      if (response.data.success && response.data.data) {
        setStudents(
          students.map((s) =>
            s._id === studentId
              ? { ...s, isActive: response.data.data.isActive }
              : s
          )
        );
        if (selectedStudent && selectedStudent._id === studentId) {
          setSelectedStudent({
            ...selectedStudent,
            isActive: response.data.data.isActive,
          });
        }
      } else {
        setError("Failed to toggle student status: Invalid response data");
      }
    } catch (err) {
      console.error("Toggle status error:", err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Error toggling student status: ${errorMessage}`);
    } finally {
      setToggleLoading((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
      setSelectedStudent(null);
      setError("");
      setModalError("");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        education: "",
        occupation: "",
        skills: "",
        interests: "",
      });
      setSearchQuery("");
    }
  };

  const openDetailsPopup = (student) => {
    setSelectedStudent(student);
  };

  const filteredStudents = students.filter((student) => {
    if (!student) return false;
    const fullName = `${student.firstName || ""} ${student.lastName || ""}`
      .toLowerCase()
      .trim();
    const email = (student.email || "").toLowerCase().trim();
    const query = (searchQuery || "").toLowerCase().trim();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div className="mb-6 mt-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-xl sm:text-3xl font-bold text-left" style={{ color: 'var(--text-color)' }}>
            Manage Students
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 pywarden

System: py-2 rounded-lg shadow hover:opacity-90 transition-colors text-sm"
            style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
          >
            Enroll Student
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="relative w-full sm:w-64 md:w-80">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm"
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
                borderColor: 'var(--border-color)',
                borderWidth: '1px',
                '--tw-ring-color': 'var(--accent-color)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                style={{ color: 'var(--text-color)' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <Loading />
      ) : filteredStudents.length === 0 ? (
        <div className="text-center" style={{ color: 'var(--text-color)' }}>
          {searchQuery
            ? "No students found matching your search."
            : "No students found."}
        </div>
      ) : (
        <>
          {isModalOpen && (
            <div
              className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 bg-black/30"
              onClick={handleOverlayClick}
            >
              <div
                className="rounded-lg p-4 sm:p-6 w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-h-[80vh] overflow-y-auto"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--accent-color)', borderWidth: '2px' }}
              >
                <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                  Enroll New Student
                </h2>
                {modalError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                    {modalError}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                        borderWidth: '1px',
                        '--tw-ring-color': 'var(--accent-color)',
                      }}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                        borderWidth: '1px',
                        '--tw-ring-color': 'var(--accent-color)',
                      }}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                        borderWidth: '1px',
                        '--tw-ring-color': 'var(--accent-color)',
                      }}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                        borderWidth: '1px',
                        '--tw-ring-color': 'var(--accent-color)',
                      }}
                      required
                      placeholder="Enter password (min 6 characters)"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                        borderWidth: '1px',
                        '--tw-ring-color': 'var(--accent-color)',
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      Education
                    </label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                        borderWidth: '1px',
                        '--tw-ring-color': 'var(--accent-color)',
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      Occupation
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                        borderWidth: '1px',
                        '--tw-ring-color': 'var(--accent-color)',
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                        borderWidth: '1px',
                        '--tw-ring-color': 'var(--accent-color)',
                      }}
                      placeholder="e.g., Python, SQL"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                      Interests (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="interests"
                      value={formData.interests}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border rounded focus:outline-none focus:ring-2 text-sm"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        color: 'var(--text-color)',
                        borderColor: 'var(--border-color)',
                        borderWidth: '1px',
                        '--tw-ring-color': 'var(--accent-color)',
                      }}
                      placeholder="e.g., AI, ML"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded text-sm"
                      style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded text-sm"
                      style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
                    >
                      Enroll
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {selectedStudent && (
            <div
              className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 bg-black/30"
              onClick={handleOverlayClick}
            >
              <div
                className="rounded-lg p-4 sm:p-6 w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-h-[80vh] overflow-y-auto"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--accent-color)', borderWidth: '2px' }}
              >
                <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: 'var(--text-color)' }}>
                  {`${selectedStudent.firstName || "N/A"} ${selectedStudent.lastName || "N/A"}`} Details
                </h2>
                <div className="space-y-2 text-sm" style={{ color: 'var(--text-color)' }}>
                  <div className="flex items-center gap-2">
                    <FaUser style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p><strong>First Name:</strong> {selectedStudent.firstName || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUser style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p><strong>Last Name:</strong> {selectedStudent.lastName || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p><strong>Email:</strong> {selectedStudent.email || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p><strong>Phone:</strong> {selectedStudent.phone || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaGraduationCap style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p><strong>Education:</strong> {selectedStudent.education || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBriefcase style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p><strong>Occupation:</strong> {selectedStudent.occupation || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCode style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p><strong>Skills:</strong> {selectedStudent.skills?.join(", ") || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaHeart style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p><strong>Interests:</strong> {selectedStudent.interests?.join(", ") || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={`inline-block px-2 py-1 ml-2 rounded-full text-xs font-medium ${
                          selectedStudent.isActive
                            ? "bg-green-500 text-white dark:bg-green-700 dark:text-green-100"
                            : "bg-red-500 text-white dark:bg-red-700 dark:text-red-100"
                        }`}
                      >
                        {selectedStudent.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaShieldAlt style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p><strong>Verified:</strong> {selectedStudent.isVerified ? "Yes" : "No"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p>
                      <strong>Created At:</strong>{" "}
                      {selectedStudent.createdAt
                        ? new Date(selectedStudent.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaSignInAlt style={{ color: 'var(--accent-color)' }} className="text-sm" />
                    <p>
                      <strong>Last Login:</strong>{" "}
                      {selectedStudent.lastLogin
                        ? new Date(selectedStudent.lastLogin).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => handleToggleStatus(selectedStudent._id)}
                    disabled={toggleLoading[selectedStudent._id]}
                    className={`px-4 py-2 rounded text-sm ${
                      selectedStudent.isActive
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    } ${toggleLoading[selectedStudent._id] ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{ color: 'var(--text-color)' }}
                  >
                    {toggleLoading[selectedStudent._id]
                      ? "Loading..."
                      : selectedStudent.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 rounded text-sm"
                    style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="hidden lg:block rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
                  <tr>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold w-1/5">
                      <div className="flex items-center gap-2">
                        <FaUser style={{ color: 'var(--accent-color)' }} className="text-sm" />
                        Name
                      </div>
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold w-1/5">
                      <div className="flex items-center gap-2">
                        <FaEnvelope style={{ color: 'var(--accent-color)' }} className="text-sm" />
                        Email
                      </div>
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold w-1/5">
                      <div className="flex items-center gap-2">
                        <FaPhone style={{ color: 'var(--accent-color)' }} className="text-sm" />
                        Phone
                      </div>
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold w-1/5">
                      <div className="flex items-center gap-2">
                        <FaCode style={{ color: 'var(--accent-color)' }} className="text-sm" />
                        Skills
                      </div>
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold w-1/5">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle style={{ color: 'var(--accent-color)' }} className="text-sm" />
                        Status
                      </div>
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold w-1/5">
                      <div className="flex items-center gap-2">
                        <FaCog style={{ color: 'var(--accent-color)' }} className="text-sm" />
                        Action
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id || Math.random()}
                      className="border-b hover:bg-[var(--accent-color)]/20 transition-colors"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <td className="py-4 px-4 sm:px-6 text-sm font-medium truncate" style={{ color: 'var(--text-color)' }}>
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              student.avatar ||
                              "https://res.cloudinary.com/dcgilmdbm/image/upload/v1747893719/default_avatar_xpw8jv.jpg"
                            }
                            alt="student avatar"
                            className="w-11 h-11 rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://res.cloudinary.com/dcgilmdbm/image/upload/v1747893719/default_avatar_xpw8jv.jpg";
                            }}
                          />
                          <span className="truncate">{`${student.firstName || "N/A"} ${student.lastName || "N/A"}`}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-sm truncate" style={{ color: 'var(--text-color)' }}>
                        {student.email || "N/A"}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-sm truncate" style={{ color: 'var(--text-color)' }}>
                        {student.phone || "N/A"}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-sm truncate" style={{ color: 'var(--text-color)' }}>
                        {student.skills?.join(", ") || "N/A"}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            student.isActive
                              ? "bg-green-500 text-white dark:bg-green-700 dark:text-green-100"
                              : "bg-red-500 text-white dark:bg-red-700 dark:text-red-100"
                          }`}
                        >
                          {student.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-sm">
                        <button
                          onClick={() => openDetailsPopup(student)}
                          className="px-3 py-1 rounded-lg text-xs"
                          style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
                        >
                          More
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student._id || Math.random()}
                className="rounded-lg shadow-md p-4 sm:p-5 border"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
              >
                <div className="mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        student.avatar ||
                        "https://res.cloudinary.com/dcgilmdbm/image/upload/v1747893719/default_avatar_xpw8jv.jpg"
                      }
                      alt="student avatar"
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://res.cloudinary.com/dcgilmdbm/image/upload/v1747893719/default_avatar_xpw8jv.jpg";
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-color)' }}>
                          {`${student.firstName || "N/A"} ${student.lastName || "N/A"}`}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            student.isActive
                              ? "bg-green-500 text-white dark:bg-green-700 dark:text-green-100"
                              : "bg-red-500 text-white dark:bg-red-700 dark:text-red-100"
                          }`}
                        >
                          {student.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm sm:text-base" style={{ color: 'var(--text-color)' }}>
                  <div className="flex items-center gap-2">
                    <FaEnvelope style={{ color: 'var(--accent-color)' }} className="text-sm sm:text-base" />
                    <p><strong>Email:</strong> {student.email || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone style={{ color: 'var(--accent-color)' }} className="text-sm sm:text-base" />
                    <p><strong>Phone:</strong> {student.phone || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCode style={{ color: 'var(--accent-color)' }} className="text-sm sm:text-base" />
                    <p><strong>Skills: </strong>{student.skills?.join(", ") || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaGraduationCap style={{ color: 'var(--accent-color)' }} className="text-sm sm:text-base" />
                    <p><strong>Education: </strong>{student.education || "N/A"}</p>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => openDetailsPopup(student)}
                      className="px-3 py-1 rounded-lg text-xs sm:text-sm"
                      style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-color)', borderColor: 'var(--border-color)', borderWidth: '1px' }}
                    >
                      More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ManageStudent;