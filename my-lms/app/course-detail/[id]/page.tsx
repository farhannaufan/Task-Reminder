// app/course-detail/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Users,
  BookOpen,
  Clock,
  Star,
  Share2,
  Download,
  Play,
  FileText,
  Video,
  Image as ImageIcon,
  CheckCircle,
  ChevronDown,
  MessageSquare,
  Bell,
  Menu,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/components/layouts/Navbar";

interface Course {
  id: string;
  title: string;
  code: string;
  instructor: string;
  progress: number;
  total_students: number;
  category: string;
  image: string;
  status: string;
  start_date: string;
  end_date: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface Task {
  id: string;
  name: string;
  course_name: string;
  due_date: string;
  description: string;
  status?: string;
  submitted_at?: string;
  grade?: number;
  feedback?: string;
}

const CourseDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("course");
  const [sectionsCollapsed, setSectionsCollapsed] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/courses/${courseId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Course not found");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCourse(data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch course");
      } finally {
        setLoading(false);
      }
    };

    const fetchTasks = async () => {
      try {
        setTasksLoading(true);
        const response = await fetch(`/api/courses/${courseId}/tasks`);

        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setTasksLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
      fetchTasks();
    }
  }, [courseId]);

  const toggleSection = (sectionId: string) => {
    setSectionsCollapsed((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = (dueDate: string, status?: string) => {
    return new Date(dueDate) < new Date() && status !== "submitted";
  };

  const getTaskStatusColor = (task: Task) => {
    if (task.status === "submitted") {
      return "text-green-600 bg-green-50";
    }
    if (isOverdue(task.due_date, task.status)) {
      return "text-red-600 bg-red-50";
    }
    return "text-yellow-600 bg-yellow-50";
  };

  const getTaskStatusIcon = (task: Task) => {
    if (task.status === "submitted") {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (isOverdue(task.due_date, task.status)) {
      return <AlertCircle className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

  // Sample course sections - you can extend this with real data
  const courseSections = [
    {
      id: "general",
      title: "General",
      items: [
        {
          id: "1",
          type: "forum",
          title: "Announcements",
          subtitle: "Forum",
          icon: MessageSquare,
          color: "bg-red-500",
        },
        {
          id: "2",
          type: "forum",
          title: "LINK UPDATE UPB 2023",
          subtitle: "Forum",
          icon: MessageSquare,
          color: "bg-red-500",
        },
      ],
    },
    {
      id: "week1",
      title: "Week 1: Introduction",
      items: [
        {
          id: "3",
          type: "video",
          title: "Course Introduction Video",
          subtitle: "Video lecture",
          icon: Video,
          color: "bg-blue-500",
        },
        {
          id: "4",
          type: "document",
          title: "Course Syllabus",
          subtitle: "PDF Document",
          icon: FileText,
          color: "bg-gray-500",
        },
      ],
    },
    // Add tasks section if there are tasks
    ...(tasks.length > 0
      ? [
          {
            id: "tasks",
            title: "Course Tasks & Assignments",
            items: tasks.map((task, index) => ({
              id: `task-${task.id}`,
              type: "task",
              title: task.name,
              subtitle: `Due: ${formatDate(task.due_date)}`,
              icon: FileText,
              color:
                task.status === "submitted"
                  ? "bg-green-500"
                  : isOverdue(task.due_date, task.status)
                  ? "bg-red-500"
                  : "bg-orange-500",
              task: task,
            })),
          },
        ]
      : []),
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-red-200 rounded-lg flex items-center justify-center mb-4">
              <span className="text-red-600 text-2xl">⚠</span>
            </div>
            <p className="text-red-600 text-lg font-medium mb-2">
              {error || "Course not found"}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Navigation */}
      <Navbar />

      {/* Hero Banner */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-80 bg-gray-400 relative overflow-hidden">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-20 gap-4 h-full w-full p-8">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 border-2 border-white rounded-full opacity-30"
                ></div>
              ))}
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-8">
            <div className="bg-white bg-opacity-50 rounded px-2 py-1 inline-block mb-4 text-black text-xs font-bold max-w-fit">
              FAKULTAS INFORMATIKA (FIF) | PRODI SI INFORMATIKA (FIF) - 2425/2 -{" "}
              {course.code} []
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {course.title.toUpperCase()}
            </h1>
          </div>
        </div>
      </div>

      {/* Course Navigation */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-transparent border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { key: "course", label: "Course" },
              { key: "tasks", label: `Tasks (${tasks.length})` },
              { key: "participants", label: "Participants" },
              { key: "grades", label: "Grades" },
              { key: "competencies", label: "Competencies" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-3 font-medium text-sm relative ${
                  activeTab === tab.key
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "course" && (
          <div className="space-y-6">
            {courseSections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </h2>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <span className="mr-1">
                        {sectionsCollapsed[section.id]
                          ? "Expand all"
                          : "Collapse all"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sectionsCollapsed[section.id] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {!sectionsCollapsed[section.id] && (
                  <div className="divide-y divide-gray-100">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 transition-colors ${
                          item.type === "task"
                            ? "hover:bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {item.type === "task" && item.task ? (
                          <Link
                            href={`/tasks/${item.task.id}`}
                            className="flex items-center space-x-4 cursor-pointer group"
                          >
                            <div
                              className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}
                            >
                              <item.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(
                                    item.task
                                  )}`}
                                >
                                  {getTaskStatusIcon(item.task)}
                                  <span className="ml-1">
                                    {item.task.status === "submitted"
                                      ? "Submitted"
                                      : isOverdue(
                                          item.task.due_date,
                                          item.task.status
                                        )
                                      ? "Overdue"
                                      : "Pending"}
                                  </span>
                                </span>
                                <ExternalLink className="w-4 h-4 text-blue-600 group-hover:text-blue-800" />
                              </div>
                              <h3 className="font-medium text-gray-900 mt-1 group-hover:text-blue-600">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {item.subtitle}
                              </p>
                              {item.task.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {item.task.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-blue-600 group-hover:text-blue-800">
                                View Task →
                              </div>
                              {item.task.grade && (
                                <div className="text-sm text-gray-600 mt-1">
                                  Grade: {item.task.grade}/100
                                </div>
                              )}
                            </div>
                          </Link>
                        ) : (
                          <div className="flex items-center space-x-4 cursor-pointer">
                            <div
                              className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center`}
                            >
                              <item.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {item.subtitle}
                                </span>
                              </div>
                              <h3 className="font-medium text-gray-900 mt-1">
                                {item.title}
                              </h3>
                            </div>
                            <div className="flex items-center space-x-2">
                              {item.type === "forum" && (
                                <span className="text-xs text-gray-500">
                                  No unread posts
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">
                Course Tasks & Assignments
              </h2>

              {tasksLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No tasks assigned for this course yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {task.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(
                                task
                              )}`}
                            >
                              {getTaskStatusIcon(task)}
                              <span className="ml-1">
                                {task.status === "submitted"
                                  ? "Submitted"
                                  : isOverdue(task.due_date, task.status)
                                  ? "Overdue"
                                  : "Pending"}
                              </span>
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600 mb-2">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span
                              className={`text-sm ${
                                isOverdue(task.due_date, task.status)
                                  ? "text-red-600 font-medium"
                                  : ""
                              }`}
                            >
                              Due: {formatDate(task.due_date)}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {task.status === "submitted" && task.submitted_at && (
                            <div className="text-green-600 text-sm mb-2">
                              ✅ Submitted on {formatDate(task.submitted_at)}
                              {task.grade && (
                                <span className="ml-2">
                                  • Grade: {task.grade}/100
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <ExternalLink className="w-5 h-5 text-blue-600 ml-4 flex-shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "participants" && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-xl font-semibold mb-4">Course Participants</h2>
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Participants list will be displayed here</p>
              <p className="text-sm">Total: {course.total_students} students</p>
            </div>
          </div>
        )}

        {activeTab === "grades" && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-xl font-semibold mb-4">Grades</h2>
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Gradebook will be displayed here</p>
            </div>
          </div>
        )}

        {activeTab === "competencies" && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-xl font-semibold mb-4">Competencies</h2>
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Course competencies will be displayed here</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default CourseDetailPage;
