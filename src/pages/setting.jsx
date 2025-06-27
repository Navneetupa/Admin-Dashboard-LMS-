import React, { useState, useEffect } from "react";
import axios from "axios";
import Loading from "./Loading";

const AdminSettings = () => {
  const [editable, setEditable] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
    updatedAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token) throw new Error("No authentication token found");

        const response = await axios.get(
          "https://lms-backend-flwq.onrender.com/api/v1/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { data } = response.data;
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          avatar: data.avatar || "",
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    setEditable(!editable);
    setUpdateStatus(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
      };

      const response = await axios.put(
        "https://lms-backend-flwq.onrender.com/api/v1/auth/updatedetails",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUpdateStatus("Profile updated successfully!");
        setFormData({ ...formData, updatedAt: new Date().toISOString() });
        setEditable(false);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      setUpdateStatus(`Error: ${err.message}`);
    }
  };

  if (loading) return <Loading />;
  if (error)
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">Error: {error}</p>
      </div>
    );

  return (
    <div className="min-h-screen px-3 sm:px-6 py-6 lg:px-8 lg:py-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md transition-colors duration-300">
        {/* Header */}
        <div className="text-center h-20 w-full rounded-xl bg-gradient-to-r from-blue-100 to-yellow-100 dark:from-blue-800 dark:to-yellow-600 mb-8">
          <h2 className="pt-3 text-xl lg:text-2xl font-semibold">
            Welcome, {formData.firstName} {formData.lastName}
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center space-x-4">
            <img
              src={formData.avatar || "https://via.placeholder.com/80"}
              alt="Profile"
              className="w-16 h-16 lg:w-20 lg:h-20 border border-gray-300 dark:border-gray-600 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg lg:text-xl font-semibold">
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{formData.email}</p>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              onClick={handleEditToggle}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              {editable ? "Cancel" : "Edit"}
            </button>
            {editable && (
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                Save
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        {updateStatus && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm ${
              updateStatus.includes("Error")
                ? "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200"
                : "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200"
            }`}
          >
            {updateStatus}
          </div>
        )}

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {["firstName", "lastName", "email", "phone"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {field.replace("Name", " Name")}
              </label>
              <input
                name={field}
                value={formData[field]}
                onChange={handleChange}
                disabled={!editable}
                placeholder={field}
                className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
              />
            </div>
          ))}
        </div>

        {/* Email Card */}
        <div className="mt-10">
          <h4 className="text-lg font-semibold mb-4">My Email Address</h4>
          <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900 p-4 rounded-xl">
            <div className="bg-blue-600 text-white rounded-full p-3 text-lg">📧</div>
            <div>
              <p className="font-medium text-sm">{formData.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {new Date(formData.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
