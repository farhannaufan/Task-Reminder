import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  Calendar,
  Clock,
  FileText,
  Video,
  Users,
  BookOpen,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

// Types
interface TimelineEvent {
  id: string;
  type: "assignment" | "quiz" | "lecture" | "discussion" | "resource";
  title: string;
  course: string;
  dueDate: string;
  status: "completed" | "overdue" | "upcoming" | "in-progress";
  description: string;
  points?: number;
}

interface TimelineProps {
  onBack?: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ onBack }) => {
  const [timeFilter, setTimeFilter] = useState("Next 7 days");
  const [sortBy, setSortBy] = useState("Sort by dates");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample timeline events
  const timelineEvents: TimelineEvent[] = [
    // {
    //   id: "1",
    //   type: "assignment",
    //   title: "Programming Assignment 3",
    //   course: "CS101",
    //   dueDate: "2024-03-20",
    //   status: "overdue",
    //   description: "Implement a sorting algorithm using recursion",
    //   points: 100,
    // },
    // {
    //   id: "2",
    //   type: "quiz",
    //   title: "Data Structures Quiz",
    //   course: "CS101",
    //   dueDate: "2024-03-25",
    //   status: "upcoming",
    //   description: "Multiple choice quiz on arrays, linked lists, and stacks",
    //   points: 50,
    // },
    // {
    //   id: "3",
    //   type: "lecture",
    //   title: "Object-Oriented Programming",
    //   course: "CS101",
    //   dueDate: "2024-03-22",
    //   status: "completed",
    //   description: "Introduction to OOP concepts and principles",
    // },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "overdue":
        return "text-red-600 bg-red-50";
      case "upcoming":
        return "text-blue-600 bg-blue-50";
      case "in-progress":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <FileText className="w-5 h-5" />;
      case "quiz":
        return <CheckCircle className="w-5 h-5" />;
      case "lecture":
        return <Video className="w-5 h-5" />;
      case "discussion":
        return <Users className="w-5 h-5" />;
      case "resource":
        return <BookOpen className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredEvents = timelineEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasEvents = filteredEvents.length > 0;

  return (
    <div className="min-h-auto bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Time Filter */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="appearance-none bg-transparent border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm text-slate-600 font-bold focus:outline-none focus:ring-3 focus:ring-red-200 focus:border-transparent"
            >
              <option value="Next 7 days">Next 7 days</option>
              <option value="Next 30 days">Next 30 days</option>
              <option value="All upcoming">All upcoming</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-transparent border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm text-slate-600 font-bold focus:outline-none focus:ring-3 focus:ring-red-200 focus:border-transparent"
            >
              <option value="Sort by dates">Sort by dates</option>
              <option value="Sort by course">Sort by course</option>
              <option value="Sort by type">Sort by type</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by activity type or name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-slate-600 font-bold w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-3 focus:ring-red-200 focus:border-transparent"
            />
          </div>
        </div>

        {/* Timeline Content */}
        <div className="bg-slate-100 rounded-lg shadow-sm border">
          {hasEvents ? (
            <div className="p-6">
              <div className="space-y-6">
                {filteredEvents.map((event, index) => (
                  <div key={event.id} className="relative">
                    {index !== filteredEvents.length - 1 && (
                      <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200"></div>
                    )}

                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-3 rounded-full ${getStatusColor(
                          event.status
                        )} flex-shrink-0`}
                      >
                        {getTypeIcon(event.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-lg">
                              {event.title}
                            </h3>
                            <p className="text-sm text-gray-600 capitalize mt-1">
                              {event.type}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              {event.description}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                event.status
                              )}`}
                            >
                              {event.status.replace("-", " ")}
                            </span>
                            {event.points && (
                              <p className="text-xs text-gray-500 mt-1">
                                {event.points} points
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-6 mt-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              Due: {formatDate(event.dueDate)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {event.course}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <p className="text-gray-500 text-lg font-medium">
                No in-progress courses
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
