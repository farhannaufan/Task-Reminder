// app/components/sections/Reminder.tsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Clock,
  Trash2,
  Bell,
  Mail,
  MessageCircle,
  Calendar,
  ChevronDown,
  BookOpen,
  AlertCircle,
} from "lucide-react";

interface Reminder {
  id: number;
  student_id: number;
  course_task_id: string;
  course_task_name: string;
  course_name: string; // Added course name
  remind_before_hours: number;
  frequency: number;
  notification_type: "email" | "whatsapp";
  contact_info: string;
  is_active: boolean;
  created_at: string;
}

interface CourseTask {
  id: string;
  name: string;
  course_name: string;
  due_date: string;
  status: string;
}

interface ReminderProps {
  onBack?: () => void;
  studentId?: number;
}

const Reminder: React.FC<ReminderProps> = ({ onBack, studentId = 1 }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [courseTasks, setCourseTasks] = useState<CourseTask[]>([]);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    courseTask: "",
    remindBefore: 1,
    frequency: 1,
    notificationType: "email" as "email" | "whatsapp",
    contactInfo: "",
  });

  useEffect(() => {
    fetchReminders();
    fetchCourseTasks();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch(`/api/reminders?student_id=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseTasks = async () => {
    try {
      const response = await fetch(`/api/course-tasks?student_id=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        // Filter out submitted tasks
        const activeTasks = data.filter(
          (task: CourseTask) => task.status !== "submitted"
        );
        setCourseTasks(activeTasks);
      }
    } catch (error) {
      console.error("Error fetching course tasks:", error);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSelectedTask = () => {
    return courseTasks.find((task) => task.id === formData.courseTask);
  };

  const calculateReminderTime = (
    dueDate: string,
    remindBeforeHours: number
  ) => {
    const due = new Date(dueDate);
    const reminderTime = new Date(
      due.getTime() - remindBeforeHours * 60 * 60 * 1000
    );
    return reminderTime;
  };

  const handleSubmit = async () => {
    if (!formData.courseTask.trim() || !formData.contactInfo.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate contact info based on notification type
    if (
      formData.notificationType === "email" &&
      !validateEmail(formData.contactInfo)
    ) {
      alert("Please enter a valid email address");
      return;
    }

    if (
      formData.notificationType === "whatsapp" &&
      !validatePhone(formData.contactInfo)
    ) {
      alert("Please enter a valid phone number");
      return;
    }

    const selectedTask = getSelectedTask();
    if (!selectedTask) {
      alert("Please select a valid course task");
      return;
    }

    const newReminder = {
      student_id: studentId,
      course_task_id: formData.courseTask,
      course_task_name: selectedTask.name,
      course_name: selectedTask.course_name, // Include course name
      remind_before_hours: formData.remindBefore,
      frequency: formData.frequency,
      notification_type: formData.notificationType,
      contact_info: formData.contactInfo,
    };

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReminder),
      });

      if (response.ok) {
        const createdReminder = await response.json();
        setReminders([...reminders, createdReminder]);
        setFormData({
          courseTask: "",
          remindBefore: 1,
          frequency: 1,
          notificationType: "email",
          contactInfo: "",
        });
        console.log("Reminder created successfully:", createdReminder);
        setIsAddingReminder(false);
        alert("Reminder created successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to create reminder: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
      alert("Error creating reminder. Please try again.");
    }
  };

  const deleteReminder = async (id: number) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReminders(reminders.filter((reminder) => reminder.id !== id));
        alert("Reminder deleted successfully!");
      } else {
        alert("Failed to delete reminder. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
      alert("Error deleting reminder. Please try again.");
    }
  };

  const getFrequencyText = (frequency: number) => {
    return frequency === 1 ? "1 time" : `${frequency} times`;
  };

  const formatContactInfo = (
    contactInfo: string,
    type: "email" | "whatsapp"
  ) => {
    if (type === "email") {
      return contactInfo;
    } else {
      return contactInfo.length > 10
        ? `${contactInfo.slice(0, 6)}...${contactInfo.slice(-4)}`
        : contactInfo;
    }
  };

  const getReminderDueDate = (courseTaskId: string) => {
    const task = courseTasks.find((task) => task.id === courseTaskId);
    return task ? task.due_date : null;
  };

  // Group course tasks by course name for better organization
  const groupedTasks = courseTasks.reduce((acc, task) => {
    if (!acc[task.course_name]) {
      acc[task.course_name] = [];
    }
    acc[task.course_name].push(task);
    return acc;
  }, {} as Record<string, CourseTask[]>);

  if (loading) {
    return (
      <div className="min-h-auto bg-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" />
          <p className="text-gray-600">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-auto bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            Hi, Farhan! 👋
          </h2>
        </div>
        <div className="mb-2">
          <h4 className="text-lg font-medium text-gray-700">Your Reminders</h4>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[68%_30%] justify-between">
          {/* Left Side - Welcome Message and Reminders List */}
          <div className="space-y-4">
            <div className="space-y-3">
              {reminders.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-lg font-medium text-gray-500">
                    No reminders set yet
                  </p>
                  <p className="text-sm text-gray-400">
                    Create your first reminder to get notified about upcoming
                    tasks
                  </p>
                </div>
              ) : (
                reminders.map((reminder) => {
                  const dueDate = getReminderDueDate(reminder.course_task_id);
                  const reminderTime = dueDate
                    ? calculateReminderTime(
                        dueDate,
                        reminder.remind_before_hours
                      )
                    : null;

                  return (
                    <div
                      key={reminder.id}
                      className="p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div className="flex items-center gap-1">
                              <h4 className="font-medium text-gray-800">
                                {reminder.course_task_name} -
                              </h4>
                              <span className="text-sm text-gray-600 font-medium">
                                {reminder.course_name}
                              </span>
                            </div>
                          </div>

                          {dueDate && (
                            <div className="flex items-center gap-1 mb-2 text-sm text-orange-600">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {formatDateShort(dueDate)}</span>
                            </div>
                          )}

                          {reminderTime && (
                            <div className="flex items-center gap-1 mb-2 text-sm text-green-600">
                              <Bell className="w-4 h-4" />
                              <span>
                                Reminder:{" "}
                                {formatDateShort(reminderTime.toISOString())}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 mb-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {reminder.remind_before_hours}{" "}
                              {reminder.remind_before_hours === 1
                                ? "hour"
                                : "hours"}{" "}
                              before
                            </span>
                            <span>{getFrequencyText(reminder.frequency)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              {reminder.notification_type === "email" ? (
                                <Mail className="w-3 h-3" />
                              ) : (
                                <MessageCircle className="w-3 h-3" />
                              )}
                              <span className="capitalize">
                                {reminder.notification_type}:
                              </span>
                              <span className="font-medium">
                                {formatContactInfo(
                                  reminder.contact_info,
                                  reminder.notification_type
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="text-gray-500 p-2 rounded-md transition-colors hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          title="Delete reminder"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {reminders.length > 0 && (
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You have {reminders.length} active
                  reminder{reminders.length !== 1 ? "s" : ""}. Notifications
                  will be sent at the exact scheduled time before each task
                  deadline.
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Add Reminder Form */}
          <div className="">
            {!isAddingReminder ? (
              <div className="p-6 bg-white rounded-lg border shadow-sm text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-4">
                  Click "Add New" to create a reminder
                </p>
                <button
                  onClick={() => setIsAddingReminder(true)}
                  className="bg-red-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Add New Reminder
                </button>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-lg border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Add Reminder
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Task
                    </label>
                    <div className="relative">
                      <select
                        value={formData.courseTask}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            courseTask: e.target.value,
                          })
                        }
                        className="text-sm text-slate-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                        required
                      >
                        <option value="">Select a task...</option>
                        {Object.keys(groupedTasks).map((courseName) => (
                          <optgroup key={courseName} label={courseName}>
                            {groupedTasks[courseName].map((task) => (
                              <option key={task.id} value={task.id}>
                                {task.name} - Due:{" "}
                                {formatDateShort(task.due_date)}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>

                    {formData.courseTask && getSelectedTask() && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="font-medium text-orange-800 mb-1">
                              {getSelectedTask()?.course_name}
                            </div>
                            <div className="text-orange-700">
                              <strong>Task:</strong> {getSelectedTask()?.name}
                            </div>
                            <div className="text-orange-700">
                              <strong>Due:</strong>{" "}
                              {formatDate(getSelectedTask()?.due_date || "")}
                            </div>
                            {getSelectedTask() && (
                              <div className="text-green-700 mt-1">
                                <strong>Reminder will be sent:</strong>{" "}
                                {formatDate(
                                  calculateReminderTime(
                                    getSelectedTask()!.due_date,
                                    formData.remindBefore
                                  ).toISOString()
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remind me before (hours)
                    </label>
                    <div className="relative">
                      <select
                        value={formData.remindBefore}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            remindBefore: parseInt(e.target.value),
                          })
                        }
                        className="text-sm text-slate-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value={1}>1 hour</option>
                        <option value={2}>2 hours</option>
                        <option value={6}>6 hours</option>
                        <option value={12}>12 hours</option>
                        <option value={24}>1 day</option>
                        <option value={48}>2 days</option>
                        <option value={168}>1 week</option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <div className="relative">
                      <select
                        value={formData.frequency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            frequency: parseInt(e.target.value),
                          })
                        }
                        className="text-sm text-slate-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value={1}>1 time</option>
                        <option value={2}>2 times</option>
                        <option value={3}>3 times</option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Number of reminder notifications to send
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            notificationType: "email",
                            contactInfo: "",
                          })
                        }
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                          formData.notificationType === "email"
                            ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                            : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <Mail className="w-5 h-5" />
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            notificationType: "whatsapp",
                            contactInfo: "",
                          })
                        }
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                          formData.notificationType === "whatsapp"
                            ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                            : "border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        WhatsApp
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.notificationType === "email"
                        ? "Email Address"
                        : "Phone Number"}
                    </label>
                    <div className="relative">
                      <input
                        type={
                          formData.notificationType === "email"
                            ? "email"
                            : "tel"
                        }
                        value={formData.contactInfo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactInfo: e.target.value,
                          })
                        }
                        placeholder={
                          formData.notificationType === "email"
                            ? "example@gmail.com"
                            : "+62812345678"
                        }
                        className="text-sm text-slate-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                        required
                      />
                      {formData.notificationType === "email" ? (
                        <Mail className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      ) : (
                        <MessageCircle className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.notificationType === "email"
                        ? "We'll send reminder notifications to this email"
                        : "Include country code (e.g., +62 for Indonesia)"}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 bg-red-600 text-white font-medium px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      Create Reminder
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingReminder(false);
                        setFormData({
                          courseTask: "",
                          remindBefore: 1,
                          frequency: 1,
                          notificationType: "email",
                          contactInfo: "",
                        });
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {courseTasks.length === 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                          No active tasks found. Make sure you have pending
                          assignments to set reminders for.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminder;
