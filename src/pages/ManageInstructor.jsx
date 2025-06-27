import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext"; // Adjust path as per your project structure
import Loading from "./Loading";
import { FaUser, FaEnvelope, FaPhone, FaCode, FaCheckCircle, FaBook, FaImage, FaInfoCircle, FaLink, FaUserTag, FaShieldAlt, FaStar, FaUsers, FaDollarSign, FaCheck, FaCalendarAlt, FaSignInAlt, FaCog } from "react-icons/fa";

const ManageInstructor = () => {
  const { token } = useAuth();
  const [instructors, setInstructors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    avatar: "",
    expertise: "",
    bio: "",
    socialLinks: { linkedin: "", twitter: "" },
    isActive: true,
    totalCourses: 0,
    role: "instructor",
    isVerified: true,
    rating: 0,
    totalStudents: 0,
    earnings: 0,
    approved: false,
  });
  const [error, setError] = useState(""); // General errors
  const [modalError, setModalError] = useState(""); // Modal-specific errors
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch instructors on component mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        if (!token) {
          throw new Error("No authentication token found");
        }
        const response = await axios.get(
          "https://lms-backend-flwq.onrender.com/api/v1/admin/users/instructors",
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );
        if (response.data.success && Array.isArray(response.data.data)) {
          setInstructors(response.data.data);
        } else {
          setError("Failed to fetch instructors: Invalid response data");
        }
      } catch (err) {
        setError(err.response?.data?.message || `Error fetching instructors: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInstructors();
    } else {
      setError("Please log in to fetch instructors");
      setLoading(false);
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const key = name.split(".")[1];
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [key]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError(""); // Clear previous modal errors

    if (!formData.password || formData.password.length < 6) {
      setModalError("Password is required and must be at least 6 characters long");
      return;
    }

    const newInstructor = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      avatar: formData.avatar || "default_avatar.jpg",
      expertise: formData.expertise
        ? formData.expertise.split(",").map((item) => item.trim())
        : [],
      bio: formData.bio,
      socialLinks: formData.socialLinks,
      isActive: formData.isActive === "true" || formData.isActive === true,
      role: "instructor",
      isVerified: true,
    };

    try {
      const response = await axios.post(
        "https://lms-backend-flwq.onrender.com/api/v1/admin/users/instructors",
        newInstructor,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      if (response.data.success && response.data.data) {
        setInstructors([response.data.data, ...instructors]);
        setIsModalOpen(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phone: "",
          avatar: "",
          expertise: "",
          bio: "",
          socialLinks: { linkedin: "", twitter: "" },
          isActive: true,
          totalCourses: 0,
          role: "instructor",
          isVerified: true,
          rating: 0,
          totalStudents: 0,
          earnings: 0,
          approved: false,
        });
        setSearchQuery("");
        setModalError(""); // Clear modal error on success
      } else {
        setModalError("Failed to enroll instructor: Invalid response data");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || `Error enrolling instructor: ${err.message}`;
      setModalError(errorMessage.includes("email") ? "This email is already registered" : errorMessage);
    }
  };

  const handleToggleStatus = async (instructorId) => {
    const instructor = instructors.find((i) => i._id === instructorId);
    if (!instructor) return setError("Instructor not found");

    const newStatus = !instructor.isActive;
    setToggleLoading((prev) => ({ ...prev, [instructorId]: true }));
    setError("");

    try {
      const response = await axios.patch(
        `https://lms-backend-flwq.onrender.com/api/v1/admin/users/instructors/${instructorId}/toggle-active`,
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
        setInstructors(
          instructors.map((instructor) =>
            instructor._id === instructorId
              ? { ...instructor, isActive: response.data.data.isActive }
              : instructor
          )
        );
        if (selectedInstructor && selectedInstructor._id === instructorId) {
          setSelectedInstructor({
            ...selectedInstructor,
            isActive: response.data.data.isActive,
          });
        }
      } else {
        setError("Failed to toggle instructor status: " + response.data.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Error toggling instructor status: ${errorMessage}`);
    } finally {
      setToggleLoading((prev) => ({ ...prev, [instructorId]: false }));
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
      setSelectedInstructor(null);
      setError("");
      setModalError(""); // Clear modal error on close
      setSearchQuery("");
    }
  };

  const openDetailsPopup = (instructor) => {
    setSelectedInstructor(instructor);
  };

  const filteredInstructors = instructors.filter((instructor) => {
    if (!instructor) return false;
    const fullName = `${instructor.firstName || ""} ${instructor.lastName || ""}`.toLowerCase().trim();
    const email = (instructor.email || "").toLowerCase().trim();
    const query = (searchQuery || "").toLowerCase().trim();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 mt-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800 text-left">
            Manage Instructors
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="card-bg text-white shadow shadow-black px-4 py-2 rounded-lg hover:card-bg transition-colors text-sm"
          >
            Enroll Instructor
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="relative w-full sm:w-64 md:w-80">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <Loading />
      ) : filteredInstructors.length === 0 ? (
        <div className="text-center text-gray-600">
          {searchQuery ? "No instructors found matching your search." : "No instructors found."}
        </div>
      ) : (
        <>
          {/* Enroll Modal */}
          {isModalOpen && (
            <div
              className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={handleOverlayClick}
            >
              <div className="bg-white border-2 border-blue-400 rounded-lg p-4 sm:p-6 w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-h-[80vh] overflow-y-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
                  Enroll New Instructor
                </h2>
                {modalError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {modalError}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                      placeholder="Enter password (min 6 characters)"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Optional image URL"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Expertise (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="e.g., JavaScript, React"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      LinkedIn URL
                    </label>
                    <input
                      type="text"
                      name="socialLinks.linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Twitter URL
                    </label>
                    <input
                      type="text"
                      name="socialLinks.twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Active Status
                    </label>
                    <select
                      name="isActive"
                      value={formData.isActive}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 card-bg text-white rounded-lg hover:card-bg transition-colors text-sm"
                    >
                      Enroll
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Details Popup */}
          {selectedInstructor && (
            <div
              className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={handleOverlayClick}
            >
              <div className="bg-white border-2 border-blue-400 rounded-lg p-4 sm:p-6 w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 max-h-[80vh] overflow-y-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
                  {`${selectedInstructor.firstName || "N/A"} ${selectedInstructor.lastName || "N/A"}`} Details
                </h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaUser className="clr text-sm" />
                    <p><strong>First Name:</strong> {selectedInstructor.firstName || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUser className="clr text-sm" />
                    <p><strong>Last Name:</strong> {selectedInstructor.lastName || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="clr text-sm" />
                    <p><strong>Email:</strong> {selectedInstructor.email || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="clr text-sm" />
                    <p><strong>Phone:</strong> {selectedInstructor.phone || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaImage className="clr text-sm" />
                    <p>
                      <strong>Avatar:</strong>{" "}
                      {selectedInstructor.avatar ? (
                        <img
                          src={selectedInstructor.avatar}
                          alt="instructor avatar"
                          className="w-11 h-11 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://res.cloudinary.com/dcgilmdbm/image/upload/v1747893719/default_avatar_xpw8jv.jpg";
                          }}
                        />
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCode className="clr text-sm" />
                    <p>
                      <strong>Expertise:</strong>{" "}
                      {selectedInstructor.expertise?.join(", ") || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBook className="clr text-sm" />
                    <p><strong>Total Courses:</strong> {selectedInstructor.totalCourses || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaInfoCircle className="clr text-sm" />
                    <p><strong>Bio:</strong> {selectedInstructor.bio || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaLink className="clr text-sm" />
                    <p>
                      <strong>Social:</strong>{" "}
                      {selectedInstructor.socialLinks && (selectedInstructor.socialLinks.linkedin || selectedInstructor.socialLinks.twitter) ? (
                        <span className="flex space-x-3">
                          {selectedInstructor.socialLinks.linkedin && (
                            <a
                              href={selectedInstructor.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs"
                            >
                              LinkedIn
                            </a>
                          )}
                          {selectedInstructor.socialLinks.twitter && (
                            <a
                              href={selectedInstructor.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline text-xs"
                            >
                              Twitter
                            </a>
                          )}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="clr text-sm" />
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          selectedInstructor.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedInstructor.isActive ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUserTag className="clr text-sm" />
                    <p><strong>Role:</strong> {selectedInstructor.role || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="clr text-sm" />
                    <p><strong>Verified:</strong> {selectedInstructor.isVerified ? "Yes" : "No"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaStar className="clr text-sm" />
                    <p><strong>Rating:</strong> {selectedInstructor.rating || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUsers className="clr text-sm" />
                    <p><strong>Total Students:</strong> {selectedInstructor.totalStudents || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaDollarSign className="clr text-sm" />
                    <p><strong>Earnings:</strong> ${selectedInstructor.earnings || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCheck className="clr text-sm" />
                    <p><strong>Approved:</strong> {selectedInstructor.approved ? "Yes" : "No"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="clr text-sm" />
                    <p>
                      <strong>Created At:</strong>{" "}
                      {selectedInstructor.createdAt
                        ? new Date(selectedInstructor.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="clr text-sm" />
                    <p>
                      <strong>Updated At:</strong>{" "}
                      {selectedInstructor.updatedAt
                        ? new Date(selectedInstructor.updatedAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaSignInAlt className="clr text-sm" />
                    <p>
                      <strong>Last Login:</strong>{" "}
                      {selectedInstructor.lastLogin
                        ? new Date(selectedInstructor.lastLogin).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => handleToggleStatus(selectedInstructor._id)}
                    disabled={toggleLoading[selectedInstructor._id]}
                    className={`px-4 py-2 text-white rounded-lg text-sm ${
                      selectedInstructor.isActive
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    } ${toggleLoading[selectedInstructor._id] ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {toggleLoading[selectedInstructor._id]
                      ? "Loading..."
                      : selectedInstructor.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                  <button
                    onClick={() => setSelectedInstructor(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Table (lg and above) */}
          <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaUser className="clr text-sm" />
                        Name
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="clr text-sm" />
                        Email
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaPhone className="clr text-sm" />
                        Phone
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaCode className="clr text-sm" />
                        Expertise
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaBook className="clr text-sm" />
                        Courses
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaCheckCircle className="clr text-sm" />
                        Status
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaCog className="clr text-sm" />
                        Action
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInstructors.map((instructor) => (
                    <tr
                      key={instructor._id || Math.random()}
                      className="border-b hover:bg-gray-100 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-gray-800 font-medium">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              instructor.avatar ||
                              "https://res.cloudinary.com/dcgilmdbm/image/upload/v1747893719/default_avatar_xpw8jv.jpg"
                            }
                            alt="instructor avatar"
                            className="w-11 h-11 rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://res.cloudinary.com/dcgilmdbm/image/upload/v1747893719/default_avatar_xpw8jv.jpg";
                            }}
                          />
                          <span>{`${instructor.firstName || "N/A"} ${instructor.lastName || "N/A"}`}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {instructor.email || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {instructor.phone || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {instructor.expertise?.join(", ") || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {instructor.totalCourses || 0}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            instructor.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {instructor.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <button
                          onClick={() => openDetailsPopup(instructor)}
                          className="card-bg shadow shadow-black text-white px-3 py-1 rounded-lg hover:card-bg transition-colors text-xs"
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
            {filteredInstructors.map((instructor) => (
              <div
                key={instructor._id || Math.random()}
                className="bg-white rounded-lg shadow-md p-4 sm:p-5 border border-gray-200"
              >
                <div className="mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        instructor.avatar ||
                        "https://res.cloudinary.com/dcgilmdbm/image/upload/v1747893719/default_avatar_xpw8jv.jpg"
                      }
                      alt="instructor avatar"
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://res.cloudinary.com/dcgilmdbm/image/upload/v1747893719/default_avatar_xpw8jv.jpg";
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                          {`${instructor.firstName || "N/A"} ${instructor.lastName || "N/A"}`}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            instructor.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {instructor.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm sm:text-base text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="clr text-sm sm:text-base" />
                    <p><strong>Email:</strong> {instructor.email || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="clr text-sm sm:text-base" />
                    <p><strong>Phone:</strong> {instructor.phone || "N/A"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCode className="clr text-sm sm:text-base" />
                    <p>
                      <strong>Expertise:</strong>{" "}
                      {instructor.expertise?.join(", ") || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBook className="clr text-sm sm:text-base" />
                    <p><strong>Courses:</strong> {instructor.totalCourses || 0}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaStar className="clr text-sm sm:text-base" />
                    <p><strong>Rating:</strong> {instructor.rating || 0}</p>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => openDetailsPopup(instructor)}
                      className="card-bg text-white shadow shadow-black px-3 py-1 rounded-lg hover:card-bg transition-colors text-xs sm:text-sm"
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

export default ManageInstructor;