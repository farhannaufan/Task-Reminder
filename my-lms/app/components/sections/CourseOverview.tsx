// components/sections/CourseOverview.tsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Grid,
  List,
  MoreVertical,
  Star,
  ArrowRight,
  Calendar,
  Users,
  BookOpen,
  Clock,
} from "lucide-react";

// Types
interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string;
  progress: number;
  total_students: number;
  category: string;
  image: string;
  status: "all" | "in-progress" | "future" | "past" | "starred" | "removed";
  start_date: string;
  end_date: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface CourseOverviewProps {
  onBack?: () => void;
}

const CourseOverview: React.FC<CourseOverviewProps> = ({ onBack }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "all" | "in-progress" | "future" | "past" | "starred" | "removed"
  >("future");
  const [sortBy, setSortBy] = useState("Sort by course name");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "summary">("grid");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/courses");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform database field names to match component expectations
        const transformedCourses = data.map((course: any) => ({
          ...course,
          totalStudents: course.total_students,
          startDate: course.start_date,
          endDate: course.end_date,
        }));

        setCourses(transformedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch courses"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Navigate to course detail page
  const handleCourseClick = (courseId: string) => {
    router.push(`/course-detail/${courseId}`);
  };

  const tabs = [
    { key: "all", label: "All", count: courses.length },
    {
      key: "in-progress",
      label: "In progress",
      count: courses.filter((c) => c.status === "in-progress").length,
    },
    {
      key: "future",
      label: "Future",
      count: courses.filter((c) => c.status === "future").length,
    },
    {
      key: "past",
      label: "Past",
      count: courses.filter((c) => c.status === "past").length,
    },
    {
      key: "starred",
      label: "Starred",
      count: courses.filter((c) => c.status === "starred").length,
    },
    {
      key: "removed",
      label: "Removed from view",
      count: courses.filter((c) => c.status === "removed").length,
    },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesTab = activeTab === "all" || course.status === activeTab;
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Sort courses based on selected criteria
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case "Sort by instructor":
        return a.instructor.localeCompare(b.instructor);
      case "Sort by date":
        return (
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
      case "Sort by course name":
      default:
        return a.title.localeCompare(b.title);
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <div
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => handleCourseClick(course.id)}
    >
      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg"></div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600">{course.code}</p>
          </div>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when clicking menu
            }}
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">{course.description}</p>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{course.instructor}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {formatDate(course.start_date)} - {formatDate(course.end_date)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {course.total_students} students
            </span>
          </div>

          {course.status === "in-progress" && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-auto bg-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Course overview
            </h1>
          </div>
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-auto bg-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Course overview
            </h1>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-red-200 rounded-lg flex items-center justify-center mb-4">
              <span className="text-red-600 text-2xl">⚠</span>
            </div>
            <p className="text-red-600 text-lg font-medium mb-2">
              Error loading courses
            </p>
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-auto bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Course overview
          </h1>

          {/* Tabs */}
          <div className="border-b border-slate-300">
            <nav className="-mb-px flex space-x-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-3  text-sm whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-red-800 text-slate-600 font-bold"
                      : "border-transparent text-gray-500 font-medium"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            {/* Sort Filter */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm text-slate-600 font-bold focus:outline-none focus:ring-3 focus:ring-red-200 focus:border-transparent"
              >
                <option value="Sort by course name">Sort by course name</option>
                <option value="Sort by instructor">Sort by instructor</option>
                <option value="Sort by date">Sort by date</option>
              </select>
              <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-slate-600 font-bold focus:outline-none focus:ring-3 focus:ring-red-200 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-1 bg-transparent rounded-md p-1 ">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "" : ""}`}
              >
                <Grid
                  className={`w-6 h-6 ${
                    viewMode === "grid" ? "text-red-800" : "text-slate-600"
                  }`}
                />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "" : ""}`}
              >
                <List
                  className={`w-6 h-6 ${
                    viewMode === "list" ? "text-red-800" : "text-slate-600"
                  }`}
                />
              </button>
              <button
                onClick={() => setViewMode("summary")}
                className={`p-2 rounded co${viewMode === "summary" ? "" : ""}`}
              >
                <MoreVertical
                  className={`w-6 h-6 ${
                    viewMode === "summary" ? "text-red-800" : "text-slate-600"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* See All Link */}
            <button className="text-red-900 hover:text-red-600 text-sm font-medium flex items-center space-x-1">
              <span>See all my courses in progress</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Course Content */}
        {sortedCourses.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {sortedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-3 h-2 bg-gray-400 rounded"></div>
                <div className="w-3 h-2 bg-gray-400 rounded"></div>
                <div className="w-3 h-2 bg-gray-400 rounded"></div>
                <div className="w-3 h-2 bg-gray-400 rounded"></div>
              </div>
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {searchTerm ? "No courses match your search" : "No courses"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseOverview;
