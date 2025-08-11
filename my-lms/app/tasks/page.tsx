// app/tasks/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Task {
  id: string;
  name: string;
  course_name: string;
  due_date: string;
  description: string;
  status?: string;
  submitted_at?: string;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/course-tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = (dueDate: string, status?: string) => {
    return new Date(dueDate) < new Date() && status !== "submitted";
  };

  const getStatusColor = (task: Task) => {
    if (task.status === "submitted") {
      return "text-green-600 bg-green-50 border-green-200";
    }
    if (isOverdue(task.due_date, task.status)) {
      return "text-red-600 bg-red-50 border-red-200";
    }
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  const getStatusIcon = (task: Task) => {
    if (task.status === "submitted") {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (isOverdue(task.due_date, task.status)) {
      return <AlertCircle className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

  const getStatusText = (task: Task) => {
    if (task.status === "submitted") {
      return "Submitted";
    }
    if (isOverdue(task.due_date, task.status)) {
      return "Overdue";
    }
    return "Pending";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Tasks
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchTasks}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-2">
            Click on any task to view details and submit your work
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Tasks Found
            </h2>
            <p className="text-gray-600">
              You don't have any tasks assigned yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {task.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        task
                      )}`}
                    >
                      {getStatusIcon(task)}
                      <span className="ml-1">{getStatusText(task)}</span>
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm truncate">{task.course_name}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
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
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {task.description}
                    </p>
                  )}

                  {task.status === "submitted" && task.submitted_at && (
                    <div className="text-green-600 text-xs">
                      Submitted on {formatDate(task.submitted_at)}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-blue-600 text-sm font-medium hover:text-blue-800">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
