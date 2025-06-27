import React, { useRef, useState, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { FaPlay } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

const CourseCard = ({ course, onCourseClick, onPlay }) => (
  <div
    key={course._id}
    className="bg-gray-50 p-4 rounded-xl shadow-lg w-80 flex-shrink-0 relative transition-transform transform hover:scale-105 cursor-pointer"
    style={{ backgroundColor: "var(--card-bg)", color: "var(--text-color)" }}
    onClick={() => onCourseClick(course._id, course.title, course.status)}
  >
    <div className="relative w-full h-36 bg-gray-200 rounded-md mb-3">
      {course.thumbnail ? (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover rounded-md"
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center rounded-md">
          <span className="text-gray-500">No Thumbnail</span>
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlay(course._id);
        }}
        className="absolute -bottom-4 right-0 bg-cyan-500 text-white p-3 rounded-full shadow-lg hover:scale-120 cursor-pointer z-50"
        title="Play Course"
      >
        <FaPlay />
      </button>
    </div>

    <h3 className="text-sm font-semibold text-center mb-1 truncate">
      {course.title}
    </h3>
    <p className="text-xs text-center mb-2 truncate">
      {course.description || "No description available"}
    </p>

    <div className="flex justify-between items-center">
      <span className="text-sm font-semibold">
        ₹{(course.discountPrice ? course.price - course.discountPrice : course.price).toFixed(2)}
      </span>
      {course.discountPrice && (
        <span className="text-xs line-through opacity-60">
          ₹{(course.price).toFixed(2)}
        </span>
      )}
    </div>

    <div className="flex justify-between items-center mt-3 text-xs">
      <span>👨‍🎓 {course.totalStudents || 0} Students</span>
      <span className="text-yellow-500">⭐ {course.rating || "0"}</span>
    </div>
  </div>
);

const InstructorRow = ({ instructor, onCourseClick, onPlay }) => {
  const scrollRef = useRef();

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 272 * 3, behavior: "smooth" });
  };

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -272 * 3, behavior: "smooth" });
  };

  return (
    <div className="mb-10 p-4 rounded-xl shadow-lg"
      style={{ backgroundColor: "var(--card-bg)", color: "var(--text-color)" }}
    >
      <h3 className="text-lg font-medium mb-3">{instructor.name}</h3>
      {instructor.courses.length === 0 ? (
        <div className="text-center opacity-60 py-4">No courses found for this instructor</div>
      ) : (
        <div className="relative overflow-hidden">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar space-x-4 pr-4"
            style={{ scrollBehavior: "smooth", overflowY: "hidden" }}
          >
            {instructor.courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onCourseClick={onCourseClick}
                onPlay={onPlay}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AllCoursesPage = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchInstructorsAndCourses = async () => {
      if (!token) {
        setError("Please log in to view courses.");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        const instructorsRes = await axios.get(
          "https://lms-backend-flwq.onrender.com/api/v1/admin/users/instructors",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const instructors = instructorsRes.data.data || [];

        const instructorsWithCourses = await Promise.all(
          instructors.map(async (instructor) => {
            try {
              const courseRes = await axios.get(
                `https://lms-backend-flwq.onrender.com/api/v1/admin/instructors/${instructor._id}/courses`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              return {
                id: instructor._id,
                name: `${instructor.firstName} ${instructor.lastName}`,
                courses: courseRes.data.data.courses.map((course) => ({
                  ...course,
                  title: course.title,
                  description: course.description,
                  price: course.price,
                  discountPrice: course.discountPrice || null,
                  totalStudents: course.totalStudents || 0,
                  rating: course.rating || 0,
                  thumbnail: course.thumbnail || null,
                  status: course.status || "Unknown",
                })),
              };
            } catch {
              return {
                id: instructor._id,
                name: `${instructor.firstName} ${instructor.lastName}`,
                courses: [],
              };
            }
          })
        );

        setCoursesData(instructorsWithCourses);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch instructors");
        setLoading(false);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchInstructorsAndCourses();
  }, [navigate, token]);

  const handleCourseClick = (courseId, courseTitle, status) => {
    navigate(`/dashboard/course-editor/${courseId}`, { state: { courseTitle, status } });
  };

  const handlePlay = (courseId) => {
    // redirect to course player or log action
  };

  if (loading) return <Loading />;
  if (error) return <div className="p-4 min-h-screen">Error: {error}</div>;

  return (
    <div
      className="p-4 mt-5 min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "var(--bg-color)", color: "var(--text-color)" }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">All Courses</h2>
      {coursesData.map((instructor) => (
        <InstructorRow
          key={instructor.id}
          instructor={instructor}
          onCourseClick={handleCourseClick}
          onPlay={handlePlay}
        />
      ))}
    </div>
  );
};

export default AllCoursesPage;
