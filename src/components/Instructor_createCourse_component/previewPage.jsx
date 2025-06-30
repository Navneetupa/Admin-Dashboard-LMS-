import { useState } from 'react';

function CoursePreviewModal({ course, imageUrl, onClose }) {
  const [isCopied, setIsCopied] = useState(false);

  // Function to copy course link (example functionality)
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-md p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-lg lg:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-5 sm:p-7">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-xl transition-colors duration-200"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Cover Image */}
        <div className="w-full h-48 sm:h-60 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center mb-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Course Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-sm">No Cover Image</span>
          )}
        </div>

        {/* Course Title & Metadata */}
        <h2 className="text-xl sm:text-3xl font-semibold text-gray-900 mb-2">
          {course.title || 'Untitled Course'}
        </h2>
        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4 border-b pb-3">
          <span>
            <strong>Category:</strong> {course.category || 'N/A'}
          </span>
          <span>
            <strong>Subcategory:</strong> {course.subCategory || 'N/A'}
          </span>
          <span>
            <strong>Language:</strong> {course.language || 'N/A'}
          </span>
        </div>

        {/* Description */}
        <section className="mb-5">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
            About This Course
          </h3>
          <p className="text-sm sm:text-base text-gray-600 bg-gray-50 p-3 rounded-lg">
            {course.description || 'No description available.'}
          </p>
        </section>

        {/* Course Details */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 text-sm text-gray-700 mb-5">
          <p>
            <strong>Instructor:</strong> {course.instructorName || 'N/A'}
          </p>
          <p>
            <strong>Level:</strong> {course.level || 'Beginner'}
          </p>
          <p>
            <strong>Duration:</strong> {course.duration || 0} hrs
          </p>
          <p>
            <strong>Price:</strong> ${course.price || 0}{' '}
            {course.discountPrice && (
              <span className="text-green-600">
                (Discount: ${course.discountPrice})
              </span>
            )}
          </p>
        </section>

        {/* Prerequisites */}
        <section className="mb-5">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
            Prerequisites
          </h3>
          {course.prerequisites?.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-gray-600">
              {course.prerequisites.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No prerequisites listed.</p>
          )}
        </section>

        {/* Learning Outcomes */}
        <section className="mb-5">
          <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-2">
            What You'll Learn
          </h3>
          {course.learningOutcomes?.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-gray-600">
              {course.learningOutcomes.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No learning outcomes listed.</p>
          )}
        </section>

        {/* Share Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleShare}
            className={`text-sm px-4 py-2 rounded-lg transition-colors duration-200 ${
              isCopied
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isCopied ? 'Link Copied!' : 'Share Course'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CoursePreviewModal;