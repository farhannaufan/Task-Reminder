// app/tasks/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  Eye,
  ExternalLink,
  User,
  BookOpen,
} from "lucide-react";
import Navbar from "@/components/layouts/Navbar";

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
  created_at?: string;
  updated_at?: string;
  student_id?: number;
  course_title?: string;
  instructor?: string;
  category?: string;
  course_image?: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionText, setSubmissionText] = useState("");

  useEffect(() => {
    fetchTask();
  }, [params.id]);

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/course-tasks/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }
      const data = await response.json();
      setTask(data);
    } catch (err) {
      setError("Failed to load task details");
      console.error("Error fetching task:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTask = async () => {
    if (!task || !submissionFile) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/course-tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "submit" }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit task");
      }

      // Update task status locally
      setTask((prev) =>
        prev
          ? {
              ...prev,
              status: "submitted",
              submitted_at: new Date().toISOString(),
            }
          : null
      );

      // Show success message
      alert("Task submitted successfully!");
    } catch (err) {
      console.error("Error submitting task:", err);
      alert("Failed to submit task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isOverdue = (dueDate: string, status?: string) => {
    return new Date(dueDate) < new Date() && status !== "submitted";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSubmissionFile(file);
    }
  };

  const getTimeRemaining = () => {
    if (!task) return "";

    const now = new Date();
    const dueDate = new Date(task.due_date);
    const timeDiff = dueDate.getTime() - now.getTime();

    if (timeDiff < 0) {
      const overdueDays = Math.floor(
        Math.abs(timeDiff) / (1000 * 60 * 60 * 24)
      );
      const overdueYears = Math.floor(overdueDays / 365);
      const remainingDays = overdueDays % 365;

      if (overdueYears > 0) {
        return `Assignment is overdue by: ${overdueYears} year ${remainingDays} days`;
      }
      return `Assignment is overdue by: ${overdueDays} days`;
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (days > 0) {
      return `${days} days ${hours} hours remaining`;
    }
    return `${hours} hours remaining`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-900"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !task) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8">
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
              {error || "Task not found"}
            </p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-red-900 text-white rounded-md hover:bg-red-500 transition-colors"
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
      {/* Header */}
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{task.name}</h1>
        </div>

        <div className="gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 py-6">
            {/* Status Pills */}
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-2" />
                Done: View
              </span>
              {task.status !== "submitted" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  To do: Make a submission
                </span>
              )}
              {task.status === "submitted" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submitted
                </span>
              )}
            </div>

            {/* Course Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">
                Course: {task.course_name}
                {task.category && ` | ${task.category}`}
                {task.instructor && ` | ${task.instructor}`}
              </p>
            </div>

            {/* Due Date */}
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Due:</span>
              <span
                className={
                  isOverdue(task.due_date, task.status)
                    ? "text-red-600 font-medium"
                    : ""
                }
              >
                {formatDate(task.due_date)}
              </span>
            </div>

            {/* Assignment Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Assignment Details
              </h2>

              <div className="mb-6">
                <span className="font-medium text-gray-700">
                  Individual Assignment.
                </span>
              </div>

              {/* Objectives */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Objectives:
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>

              {/* Show feedback if available */}
              {task.feedback && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">
                    Instructor Feedback:
                  </h4>
                  <p className="text-yellow-800">{task.feedback}</p>
                  {task.grade && (
                    <p className="text-yellow-800 mt-2 font-semibold">
                      Grade: {task.grade}/100
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submission Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Submission status
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Submission status</span>
                  <span className="text-gray-500">
                    {task.status === "submitted"
                      ? "Submitted"
                      : "No submissions have been made yet"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Grading status</span>
                  <span className="text-gray-500">
                    {task.grade ? `${task.grade}/100` : "Not graded"}
                  </span>
                </div>

                <div className="flex justify-between items-start py-2">
                  <span className="text-gray-600">Time remaining</span>
                  <span
                    className={`text-right text-sm ${
                      isOverdue(task.due_date, task.status)
                        ? "text-red-600 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {getTimeRemaining()}
                  </span>
                </div>
              </div>
            </div>

            {/* Submission Section */}
            {task.status !== "submitted" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Submit Assignment
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".zip,.rar,.pdf,.doc,.docx,.py,.js,.html,.css"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ZIP, RAR, PDF, DOC, Code files up to 10MB
                        </p>
                      </label>
                    </div>
                    {submissionFile && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {submissionFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent text-gray-700"
                      placeholder="Add any additional comments about your submission..."
                    />
                  </div>

                  <button
                    onClick={handleSubmitTask}
                    disabled={!submissionFile || submitting}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                      submissionFile && !submitting
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Submit Assignment"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submission History */}
            {task.status === "submitted" && task.submitted_at && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Submission History
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        Assignment Submitted
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {formatDate(task.submitted_at)}
                      </p>
                      {task.grade && (
                        <p className="text-xs text-green-600 mt-1">
                          Graded: {task.grade}/100
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
        </div>
      </div>
    </div>
  );
}
