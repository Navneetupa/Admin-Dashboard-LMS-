import { useState, useEffect, useReducer } from 'react';
import GeneralInfo from '../Instructor_createCourse_component/generalInfo';
import { useNavigate } from 'react-router-dom';
import PreviewModal from '../Instructor_createCourse_component/previewPage';
import { useAuth } from '../../AuthContext';

function CreateCourse() {
  const initialState = {
    title: '',
    subtitle: '',
    description: '',
    category: '',
    subCategory: '',
    language: 'English',
    instructorId: '',
    level: '',
    duration: '',
    price: '',
    discountPrice: '',
    prerequisites: [],
    learningOutcomes: [],
  };

  const { token } = useAuth();

  const reducer = (state, action) => {
    switch (action.type) {
      case 'SET_FIELD':
        return { ...state, [action.field]: action.value };
      case 'SET_PREREQUISITE':
        return {
          ...state,
          prerequisites: state.prerequisites.map((item, index) =>
            index === action.index ? action.value : item
          ),
        };
      case 'ADD_PREREQUISITE':
        return { ...state, prerequisites: [...state.prerequisites, ''] };
      case 'REMOVE_PREREQUISITE':
        return {
          ...state,
          prerequisites: state.prerequisites.filter((_, index) => index !== action.index),
        };
      case 'SET_LEARNING_OUTCOME':
        return {
          ...state,
          learningOutcomes: state.learningOutcomes.map((item, index) =>
            index === action.index ? action.value : item
          ),
        };
      case 'ADD_LEARNING_OUTCOME':
        return { ...state, learningOutcomes: [...state.learningOutcomes, ''] };
      case 'REMOVE_LEARNING_OUTCOME':
        return {
          ...state,
          learningOutcomes: state.learningOutcomes.filter((_, index) => index !== action.index),
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeTab, setActiveTab] = useState('General');
  const [coverImage, setCoverImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    document.body.style.overflow = showPreview ? 'hidden' : 'auto';
  }, [showPreview]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-10 py-[5px]" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      {/* Cover Image Upload */}
      <div className="relative w-full h-48 sm:h-60 rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--card-bg)' }}>
        {coverImage ? (
          <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm sm:text-base" style={{ color: 'var(--text-color)' }}>
            Upload cover
          </span>
        )}
        <label className="absolute bottom-4 left-4 px-3 py-1 rounded-md text-sm cursor-pointer shadow-md hover:opacity-90 transition" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
          Upload cover
          <input type="file" onChange={handleCoverChange} className="hidden" accept="image/*" />
        </label>
      </div>

      {/* Course Form Container */}
      <div className="w-full mx-auto p-4 sm:p-6 rounded-xl shadow-md" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
        {/* Tabs */}
        <div className="flex flex-wrap sm:space-x-6 border-b mt-10" style={{ borderColor: 'var(--border-color)' }}>
          {['General'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 pr-4 sm:pr-0 border-b-2 text-sm sm:text-base cursor-pointer ${
                activeTab === tab
                  ? 'font-medium'
                  : 'hover:opacity-70'
              }`}
              style={{
                borderColor: activeTab === tab ? 'var(--accent-color)' : 'transparent',
                color: activeTab === tab ? 'var(--accent-color)' : 'var(--text-color)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conditional Rendering */}
        {activeTab === 'General' && (
          <GeneralInfo state={state} dispatch={dispatch} onPreview={() => setShowPreview(true)} />
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          courseData={state}
          coverImage={coverImage}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

export default CreateCourse;