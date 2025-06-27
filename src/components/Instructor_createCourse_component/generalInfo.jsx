import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

function GeneralInfo({ state, dispatch, onPreview }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [instructorLoading, setInstructorLoading] = useState(true);
  const [instructorError, setInstructorError] = useState(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  const setField = (field, value) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const handleNumberInput = (value, field) => {
    setField(field, value === '' ? '' : Number(value));
  };

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  // Fetch instructors from API
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const API_URL = 'https://lms-backend-flwq.onrender.com';
        const response = await axios.get(`${API_URL}/api/v1/admin/users/instructors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInstructors(response.data.data || []);
        setInstructorLoading(false);
      } catch (error) {
        setInstructorError(
          error.response?.data?.message || 'Failed to fetch instructors. Please try again.'
        );
        setInstructorLoading(false);
      }
    };

    if (token) {
      fetchInstructors();
    } else {
      setInstructorError('Please log in to fetch instructors.');
      setInstructorLoading(false);
    }
  }, [token]);

  const handleSave = async () => {
    // Basic validation
    if (!state.title || !state.category || !state.language || !state.instructorId) {
      setMessage('Please fill in Title, Category, Language, and Instructor.');
      return;
    }
    if (state.price < 0 || state.discountPrice < 0 || state.duration < 0) {
      setMessage('Price, discount price, and duration cannot be negative.');
      return;
    }
    if (!isValidObjectId(state.instructorId)) {
      setMessage('Selected Instructor ID must be a valid 24-character hex string.');
      return;
    }

    setLoading(true);
    setMessage('');

    if (!token) {
      setMessage('Please log in to save the course.');
      navigate('/login');
      return;
    }

    try {
      const API_URL = 'https://lms-backend-flwq.onrender.com';
      const payload = {
        title: state.title,
        subtitle: state.subtitle,
        description: state.description,
        instructorId: state.instructorId,
        category: state.category,
        subCategory: state.subCategory,
        language: state.language,
        level: state.level,
        duration: Number(state.duration),
        price: Number(state.price),
        discountPrice: Number(state.discountPrice),
        prerequisites: state.prerequisites.filter((item) => item.trim() !== ''),
        learningOutcomes: state.learningOutcomes.filter((item) => item.trim() !== ''),
      };

      // console.log('Sending to:', `${API_URL}/api/v1/admin/courses`);
      // console.log('Payload:', payload);
      // console.log('Token:', token);

      const response = await axios.post(`${API_URL}/api/v1/admin/courses`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setMessage('Course saved successfully!');
        setTimeout(() => navigate('/manage-courses'), 2000);
      } else {
        setMessage('Failed to save course.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      setMessage(
        error.response
          ? 'Server error: ' + (error.response.data.message || 'Try again.')
          : 'Cannot connect to server. Check your connection.'
      );
      if (error.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 mt-10 sm:mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Course Title
          </label>
          <input
            type="text"
            value={state.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="e.g., React"
            aria-label="Course title"
            className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Course Subtitle
          </label>
          <input
            type="text"
            value={state.subtitle}
            onChange={(e) => setField('subtitle', e.target.value)}
            placeholder="e.g., Build complex applications with React"
            aria-label="Course subtitle"
            className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Course Description
        </label>
        <textarea
          value={state.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="e.g., Learn advanced React patterns and techniques"
          rows={4}
          aria-label="Course description"
          className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm resize-none focus:ring-2 focus:ring-teal-600 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={state.category}
            onChange={(e) => setField('category', e.target.value)}
            placeholder="e.g., Web Development"
            aria-label="Course category"
            className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Subcategory
          </label>
          <input
            type="text"
            value={state.subCategory}
            onChange={(e) => setField('subCategory', e.target.value)}
            placeholder="e.g., React"
            aria-label="Course subcategory"
            className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Instructor
          </label>
          {instructorLoading ? (
            <p className="text-xs sm:text-sm text-gray-600">Loading instructors...</p>
          ) : instructorError ? (
            <p className="text-xs sm:text-sm text-red-600">{instructorError}</p>
          ) : (
            <select
              value={state.instructorId}
              onChange={(e) => setField('instructorId', e.target.value)}
              aria-label="Select Instructor"
              className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
            >
              <option value="">Select Instructor</option>
              {instructors.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {`${instructor.firstName} ${instructor.lastName} (${instructor._id})`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={state.language}
            onChange={(e) => setField('language', e.target.value)}
            aria-label="Course language"
            className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          >
            <option value="">Select Language</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
          </select>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Level
          </label>
          <select
            value={state.level}
            onChange={(e) => setField('level', e.target.value)}
            aria-label="Course level"
            className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          >
            <option value="">Select Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Duration (hrs)
          </label>
          <input
            type="number"
            value={state.duration}
            onChange={(e) => handleNumberInput(e.target.value, 'duration')}
            min={0}
            step={0.1}
            placeholder="e.g., 15"
            aria-label="Course duration"
            className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Price (₹)
          </label>
          <input
            type="number"
            value={state.price}
            onChange={(e) => handleNumberInput(e.target.value, 'price')}
            min={0}
            step={0.01}
            placeholder="e.g., 129.99"
            aria-label="Course price"
            className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Discount Price (₹)
          </label>
          <input
            type="number"
            value={state.discountPrice}
            onChange={(e) => handleNumberInput(e.target.value, 'discountPrice')}
            min={0}
            step={0.01}
            placeholder="e.g., 99.99"
            aria-label="Course discount price"
            className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Prerequisites
        </label>
        {state.prerequisites.map((item, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => dispatch({ type: 'SET_PREREQUISITE', index, value: e.target.value })}
              placeholder="e.g., Basic JavaScript"
              aria-label={`Prerequisite ${index + 1}`}
              className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
            />
            <button
              onClick={() => dispatch({ type: 'REMOVE_PREREQUISITE', index })}
              className="ml-2 text-red-600 hover:text-red-800 text-xs sm:text-sm"
              aria-label={`Remove prerequisite ${index + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => dispatch({ type: 'ADD_PREREQUISITE' })}
          className="text-teal-600 hover:text-teal-800 text-xs sm:text-sm"
          aria-label="Add new prerequisite"
        >
          + Add Prerequisite
        </button>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
          Learning Outcomes
        </label>
        {state.learningOutcomes.map((item, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) =>
                dispatch({ type: 'SET_LEARNING_OUTCOME', index, value: e.target.value })
              }
              placeholder="e.g., Build scalable React apps"
              aria-label={`Learning Outcome ${index + 1}`}
              className="w-full border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 outline-none"
            />
            <button
              onClick={() => dispatch({ type: 'REMOVE_LEARNING_OUTCOME', index })}
              className="ml-2 text-red-600 hover:text-red-800 text-xs sm:text-sm"
              aria-label={`Remove learning outcome ${index + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() => dispatch({ type: 'ADD_LEARNING_OUTCOME' })}
          className="text-teal-600 hover:text-teal-800 text-xs sm:text-sm"
          aria-label="Add new learning outcome"
        >
          + Add Learning Outcome
        </button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          onClick={handleSave}
          disabled={loading || instructorLoading}
          aria-label={loading ? 'Saving course' : 'Save course'}
          className="bg-teal-600 shadow shadow-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onPreview}
          aria-label="Preview course"
          className="border shadow shadow-black border-teal-600 text-teal-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-teal-50 text-xs sm:text-sm"
        >
          Preview
        </button>
      </div>

      {(message || instructorError) && (
        <p
          className={`mt-3 sm:mt-4 text-xs sm:text-sm ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message || instructorError}
        </p>
      )}
    </div>
  );
}

export default GeneralInfo;