import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext"; // Adjust path if needed
import Loading from "./Loading"; // Import the Loading component
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
  const [error, setError] = useState(""); // General errors
  const [modalError, setModalError] = useState(""); // Modal-specific errors
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
    setModalError(""); // Clear modal-specific error

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
      skills: formData.skills,
      interests: formData.interests,
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
      setModalError(""); // Clear modal error on close
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
    <div className="container mx-auto p-4 sm:p-6 bg-gray-900 min-h-screen">
      <div className="mb-6 mt-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-100 text-left">
            Manage Students
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white shadow shadow-black px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <Loading />
      ) : filteredStudents.length === 0 ? (
        <div className="text-center text-gray-400">
          {searchQuery
            ? "No students found matching your search."
            : "No students found."}
        </div>
      ) : (
        <>
          {isModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={handleOverlayClick}
            >
              <div className="bg-gray-800 border-2 border-blue-600 rounded-lg p-4 sm:p-6 w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-h-[80vh] overflow-y-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-100">
                  Enroll New Student
                </h2>
                {modalError && (
                  <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-lg text-sm">
                    {modalError}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-700 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-700 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-700 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-700 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                      placeholder="Enter password (min 6 characters)"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-700 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Education
                    </label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-700 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Occupation
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-700 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills || "N/A"}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-700 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g., Python, SQL"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Interests (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="interests"
                      value={formData.interests}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-700 rounded bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g., AI, ML"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-gray-400 hover:text-gray-200 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={handleOverlayClick}
            >
              <div className="bg-gray-800 border-2 border-blue-600 rounded-lg p-4 sm:p-6 w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-h-[80vh] overflow-y-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-100">
                  {`${selectedStudent.firstName || "N/A"} ${
                    selectedStudent.lastName || "N/A"
                  }`}{" "}
                  Details
                </h2>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-blue-400 text-sm" />
                    <p>
                      <strong>First Name:</strong>{" "}
                      {selectedStudent.firstName || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUser className="text-blue-400 text-sm" />
                    <p>
                      <strong>Last Name:</strong>{" "}
                      {selectedStudent.lastName || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-blue-400 text-sm" />
                    <p>
                      <strong>Email:</strong> {selectedStudent.email || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-blue-400 text-sm" />
                    <p>
                      <strong>Phone:</strong> {selectedStudent.phone || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaGraduationCap className="text-blue-400 text-sm" />
                    <p>
                      <strong>Education:</strong>{" "}
                      {selectedStudent.education || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBriefcase className="text-blue-400 text-sm" />
                    <p>
                      <strong>Occupation:</strong>{" "}
                      {selectedStudent.occupation || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCode className="text-blue-400 text-sm" />
                    <p>
                      <strong>Skills:</strong> {selectedStudent.skills || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaHeart className="text-blue-400 text-sm" />
                    <p>
                      <strong>Interests:</strong>{" "}
                      {selectedStudent.interests || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-blue-400 text-sm" />
                    <p>
                      <strong>Status:</strong>
                      <span
                        className={`inline-block px-2 py-1 ml-2 rounded-full text-xs font-medium ${
                          selectedStudent.isActive
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {selectedStudent.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="text-blue-400 text-sm" />
                    <p>
                      <strong>Verified:</strong>{" "}
                      {selectedStudent.isVerified ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-400 text-sm" />
                    <p>
                      <strong>Created At:</strong>{" "}
                      {selectedStudent.createdAt
                        ? new Date(selectedStudent.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaSignInAlt className="text-blue-400 text-sm" />
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
                    className={`px-4 py-2 text-white rounded-lg text-sm ${
                      selectedStudent.isActive
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    } ${
                      toggleLoading[selectedStudent._id]
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {toggleLoading[selectedStudent._id]
                      ? "Loading..."
                      : selectedStudent.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Layout (lg and above) - Table */}
          <div className="hidden lg:block bg-gray-800 rounded-lg shadow-md">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold text-gray-300 w-1/5">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-blue-400 text-sm" />
                        Name
                      </div>
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold text-gray-300 w-1/5">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-blue-400 text-sm" />
                        Email
                      </div>
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold text-gray-300 w-1/5">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-blue-400 text-sm" />
                        Phone
                      </div>
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold text-gray-300 w-1/5">
                      <div className="flex items-center gap-2">
                        <FaCode className="text-blue-400 text-sm" />
                        Skills
                      </div>
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold text-gray-300 w-1/5">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-blue-400 text-sm" />
                        Status
                      </div>
                    </th>
                    <th className="py-4 px-4 sm:px-6 text-left text-sm font-semibold text-gray-300 w-1/5">
                      <div className="flex items-center gap-2">
                        <FaCog className="text-blue-400 text-sm" />
                        Action
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id || Math.random()}
                      className="border-b border-gray-700 hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6 text-sm text-gray-200 font-medium truncate">
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
                          <span className="truncate">{`${student.firstName || "N/A"} ${
                            student.lastName || "N/A"
                          }`}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-sm text-gray-300 truncate">
                        {student.email || "N/A"}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-sm text-gray-300 truncate">
                        {student.phone || "N/A"}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-sm text-gray-300 truncate">
                        {student.skills?.join(", ") || "N/A"}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            student.isActive
                              ? "bg-green-900 text-green-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {student.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-sm">
                        <button
                          onClick={() => openDetailsPopup(student)}
                          className="bg-blue-600 text-white shadow shadow-black px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-xs"
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

          {/* Tablet and Mobile Layout (below lg) - Card-based */}
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student._id || Math.random()}
                className="bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 border border-gray-700"
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
                        <h3 className="text-base sm:text-lg font-semibold text-gray-100">
                          {`${student.firstName || "N/A"} ${
                            student.lastName || "N/A"
                          }`}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            student.isActive
                              ? "bg-green-900 text-green-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {student.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm sm:text-base text-gray-300">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-blue-400 text-sm sm:text-base" />
                    <p>
                      <strong>Email:</strong> {student.email || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-blue-400 text-sm sm:text-base" />
                    <p>
                      <strong>Phone:</strong> {student.phone || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCode className="text-blue-400 text-sm sm:text-base" />
                    <p>
                      <strong>Skills: </strong>
                      {student.skills?.join(", ") || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaGraduationCap className="text-blue-400 text-sm sm:text-base" />
                    <p>
                      <strong>Education: </strong>
                      {student.education || "N/A"}
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => openDetailsPopup(student)}
                      className="bg-blue-600 text-white shadow shadow-black px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
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