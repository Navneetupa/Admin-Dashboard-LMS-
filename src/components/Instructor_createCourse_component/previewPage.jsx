
function PreviewModal({ courseData, coverImage, onClose }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white/40 backdrop-blur-sm px-2 sm:px-4 md:px-6">
      <div className="relative bg-white w-full min-w-[300px] max-w-xl sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl shadow-xl p-4 sm:p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 text-gray-500 hover:text-gray-700 text-lg sm:text-xl cursor-pointer"
          aria-label="Close preview"
        >
          ✕
        </button>

        {/* Cover Image */}
        <div className="w-full h-52 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center mb-5">
          {coverImage ? (
            <img
              src={coverImage}
              alt="Preview Cover"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-gray-500">No Cover Image</div>
          )}
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-lg sm:text-2xl font-bold text-slate-800 mb-1">
          {courseData.title || 'Untitled Course'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 border-b pb-2">
          <strong>Subtitle:</strong> {courseData.subtitle || 'N/A'}<br />
          <strong>Language:</strong> {courseData.language || 'N/A'} |{' '}
          <strong>Category:</strong> {courseData.category || 'N/A'} |{' '}
          <strong>Subcategory:</strong> {courseData.subCategory || 'N/A'}
        </p>

        {/* Description */}
        <div className="mb-3 sm:mb-4">
          <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">
            Description
          </h3>
          <p className="text-gray-700 whitespace-pre-wrap text-xs sm:text-sm p-2 sm:p-3 bg-gray-50 rounded-lg">
            {courseData.description || 'No description provided.'}
          </p>
        </div>

        {/* Course Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700 border-t pt-3 sm:pt-4">
          <p>
            <strong>Instructor ID:</strong> {courseData.instructorId || 'N/A'}
          </p>
          <p>
            <strong>Level:</strong> {courseData.level || 'N/A'}
          </p>
          <p>
            <strong>Duration:</strong> {courseData.duration || 0} hours
          </p>
          <p>
            <strong>Price:</strong> ₹{courseData.price || 0}
          </p>
          <p>
            <strong>Discount Price:</strong> ₹{courseData.discountPrice || 0}
          </p>
        </div>

        {/* Prerequisites */}
        <div className="mt-3 sm:mt-4">
          <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">
            Prerequisites
          </h3>
          {courseData.prerequisites?.length > 0 ? (
            <ul className="list-disc pl-4 text-xs sm:text-sm text-gray-700">
              {courseData.prerequisites.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs sm:text-sm text-gray-700">
              No prerequisites provided.
            </p>
          )}
        </div>

        {/* Learning Outcomes */}
        <div className="mt-3 sm:mt-4">
          <h3 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">
            Learning Outcomes
          </h3>
          {courseData.learningOutcomes?.length > 0 ? (
            <ul className="list-disc pl-4 text-xs sm:text-sm text-gray-700">
              {courseData.learningOutcomes.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs sm:text-sm text-gray-700">
              No learning outcomes provided.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;
