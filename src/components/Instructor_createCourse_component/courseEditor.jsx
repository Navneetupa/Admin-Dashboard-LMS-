import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Notification Component
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-2xl text-white ${
        type === "error" ? "bg-red-600" : "bg-green-600"
      } transition-opacity duration-300 z-[1000] max-w-[90%] sm:max-w-md animate-fade-in`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
          <h1 className="text-2xl font-bold text-red-600">Something went wrong.</h1>
          <p className="text-base text-gray-600 mt-2">
            {this.state.error?.message || "Please try again later."}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const CourseManagement = () => {
  const { state } = useLocation();
  const { courseId } = useParams();
  const navigate = useNavigate();

  const initialCourseDetails = {
    title: state?.courseTitle || "",
    subtitle: state?.subtitle || "",
    description: state?.description || "",
    category: state?.category || "",
    subCategory: state?.subCategory || "",
    level: state?.level || "",
  };
  const initialStatus = state?.status || "draft";

  const [courseDetails, setCourseDetails] = useState(initialCourseDetails);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [promoVideoFile, setPromoVideoFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [promoVideoPreview, setPromoVideoPreview] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  const handleUpdateCourseDetails = async () => {
    if (!courseDetails.title.trim()) {
      showNotification("Course title is required.");
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showNotification("Please log in to update course details.");
        navigate("/login");
        return;
      }
      await axios.put(
        `https://lms-backend-flwq.onrender.com/api/v1/admin/courses/${courseId}`,
        courseDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsTitleModalOpen(false);
      showNotification("Course details updated successfully!", "success");
    } catch (error) {
      console.error("Error updating course details:", error);
      if (error.response?.status === 401) {
        showNotification("Session expired or invalid. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/login");
        return;
      }
      showNotification("Failed to update course details.");
    }
  };

  const handleDeleteCourse = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showNotification("Please log in to delete course.");
        navigate("/login");
        return;
      }
      await axios.delete(
        `https://lms-backend-flwq.onrender.com/api/v1/admin/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsDeleteModalOpen(false);
      showNotification("Course deleted successfully!", "success");
      navigate("/manage-courses");
    } catch (error) {
      console.error("Error deleting course:", error);
      if (error.response?.status === 401) {
        showNotification("Session expired or invalid. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/login");
        return;
      }
      showNotification("Failed to delete course.");
    }
  };

  const handleThumbnailUpload = async () => {
    if (!thumbnailFile) {
      showNotification("Please select a thumbnail file.");
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showNotification("Please log in to upload thumbnail.");
        navigate("/login");
        return;
      }
      const formData = new FormData();
      formData.append("thumbnail", thumbnailFile);
      await axios.post(
        `https://lms-backend-flwq.onrender.com/api/v1/admin/courses/${courseId}/thumbnail`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setThumbnailFile(null);
      setThumbnailPreview(null);
      showNotification("Thumbnail uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      if (error.response?.status === 401) {
        showNotification("Session expired or invalid. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/login");
        return;
      }
      showNotification("Failed to upload thumbnail.");
    }
  };

  const handlePromoVideoUpload = async () => {
    if (!promoVideoFile) {
      showNotification("Please select a promo video file.");
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showNotification("Please log in to upload promo video.");
        navigate("/login");
        return;
      }
      const formData = new FormData();
      formData.append("promoVideo", promoVideoFile);
      await axios.post(
        `https://lms-backend-flwq.onrender.com/api/v1/admin/courses/${courseId}/promo-video`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPromoVideoFile(null);
      setPromoVideoPreview(null);
      showNotification("Promo video uploaded successfully!", "success");
    } catch (error) {
      console.error("Error uploading promo video:", error);
      if (error.response?.status === 401) {
        showNotification("Session expired or invalid. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/login");
        return;
      }
      showNotification("Failed to upload promo video.");
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showNotification("Please log in to update course status.");
        navigate("/login");
        return;
      }
      await axios.put(
        `https://lms-backend-flwq.onrender.com/api/v1/admin/courses/${courseId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus(newStatus);
      showNotification(`Course status updated to "${newStatus}" successfully!`, "success");
    } catch (error) {
      console.error("Error updating course status:", error);
      if (error.response?.status === 401) {
        showNotification("Session expired or invalid. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/login");
        return;
      }
      showNotification("Failed to update course status.");
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    setThumbnailFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handlePromoVideoChange = (e) => {
    const file = e.target.files[0];
    setPromoVideoFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPromoVideoPreview(previewUrl);
    } else {
      setPromoVideoPreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      if (promoVideoPreview) URL.revokeObjectURL(promoVideoPreview);
    };
  }, [thumbnailPreview, promoVideoPreview]);

  return (
    <ErrorBoundary>
      <div className="bg-gray-50 py-6 px-4 sm:px-6 md:px-8 lg:px-12">
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: "", type: "" })}
        />
        <div className="max-w-7xl mx-auto sm:w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center sm:text-left">
            Manage Your Course
          </h1>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {courseDetails.title || "Untitled Course"}
                </h2>
                <span className="text-sm text-gray-500">
                  (Status: {status.charAt(0).toUpperCase() + status.slice(1)})
                </span>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-end gap-3 mt-4 sm:mt-0">
                <button
                  onClick={() => setIsTitleModalOpen(true)}
                  className="py-2 px-4 rounded-lg bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 transition"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="py-2 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                >
                  Delete Course
                </button>
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className="py-2 px-4 rounded-lg bg-[#49BBBD] text-white text-sm font-medium hover:bg-[#3a9a9b] transition focus:ring-2 focus:ring-[#49BBBD] focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Thumbnail</h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#49BBBD] file:text-white hover:file:bg-[#3a9a9b]"
              />
              {thumbnailPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Thumbnail Preview:</p>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className="max-w-full h-auto rounded-md shadow-md mx-auto sm:mx-0"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              )}
              <button
                onClick={handleThumbnailUpload}
                disabled={!thumbnailFile}
                className="mt-4 py-2 px-4 rounded-lg bg-[#49BBBD] text-white text-sm font-medium hover:bg-[#3a9a9b] disabled:bg-gray-400 disabled:cursor-not-allowed transition w-full sm:w-auto"
              >
                Upload Thumbnail
              </button>
            </div>
            {/* <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Promo Video</h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Promo Video
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handlePromoVideoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#49BBBD] file:text-white hover:file:bg-[#3a9a9b]"
              />
              {promoVideoPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Promo Video Preview:</p>
                  <video
                    src={promoVideoPreview}
                    controls
                    className="max-w-full h-auto rounded-md shadow-md mx-auto sm:mx-0"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              )}
              <button
                onClick={handlePromoVideoUpload}
                disabled={!promoVideoFile}
                className="mt-4 py-2 px-4 rounded-lg bg-[#49BBBD] text-white text-sm font-medium hover:bg-[#3a9a9b] disabled:bg-gray-400 disabled:cursor-not-allowed transition w-full sm:w-auto"
              >
                Upload Promo Video
              </button>
            </div> */}
          </div>

          {isTitleModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-lg p-4 sm:p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Edit Course Details</h3>
                <div className="space-y-4 overflow-y-auto max-h-[70vh]">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent outline-none transition"
                      placeholder="Enter Course Title"
                      value={courseDetails.title}
                      onChange={(e) =>
                        setCourseDetails({ ...courseDetails, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent outline-none transition"
                      placeholder="Enter Subtitle"
                      value={courseDetails.subtitle}
                      onChange={(e) =>
                        setCourseDetails({ ...courseDetails, subtitle: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent outline-none transition"
                      placeholder="Enter Description"
                      rows="4"
                      value={courseDetails.description}
                      onChange={(e) =>
                        setCourseDetails({ ...courseDetails, description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent outline-none transition"
                      placeholder="Enter Category"
                      value={courseDetails.category}
                      onChange={(e) =>
                        setCourseDetails({ ...courseDetails, category: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory
                    </label>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent outline-none transition"
                      placeholder="Enter Subcategory"
                      value={courseDetails.subCategory}
                      onChange={(e) =>
                        setCourseDetails({ ...courseDetails, subCategory: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#49BBBD] focus:border-transparent outline-none transition"
                      value={courseDetails.level}
                      onChange={(e) =>
                        setCourseDetails({ ...courseDetails, level: e.target.value })
                      }
                    >
                      <option value="">Select Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleUpdateCourseDetails}
                    disabled={!courseDetails.title.trim()}
                    className="py-2 px-4 rounded-lg bg-[#49BBBD] text-white text-sm font-medium hover:bg-[#3a9a9b] disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setIsTitleModalOpen(false)}
                    className="py-2 px-4 rounded-lg bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-md p-4 sm:p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Delete Course</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete this course? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleDeleteCourse}
                    className="py-2 px-4 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="py-2 px-4 rounded-lg bg-gray-200 text-gray-800 text-sm font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

      </ErrorBoundary>
    );
};

export default CourseManagement;