import React, { useState } from "react";
import {
  X,
  GraduationCap,
  ChevronDown,
  Search,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface CourseCategory {
  id: string;
  name: string;
  code: string;
  icon?: React.ReactNode;
}

interface TimelineFilter {
  label: string;
  value: string;
}

interface BlockDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: CourseCategory[];
  onCategorySelect?: (category: CourseCategory) => void;
  onTimelineFilterChange?: (filter: string) => void;
  onSortChange?: (sort: string) => void;
  onSearch?: (query: string) => void;
}

const BlockDrawer: React.FC<BlockDrawerProps> = ({
  isOpen,
  onClose,
  categories = [
    { id: "feb", name: "FAKULTAS EKONOMI DAN BISNIS", code: "FEB" },
    { id: "fit", name: "FAKULTAS ILMU TERAPAN", code: "FIT" },
    { id: "fik", name: "FAKULTAS INDUSTRI KREATIF", code: "FIK" },
    { id: "fif", name: "FAKULTAS INFORMATIKA", code: "FIF" },
    { id: "fks", name: "FAKULTAS KOMUNIKASI DAN ILMU SOSIAL", code: "FKS" },
    { id: "fri", name: "FAKULTAS REKAYASA INDUSTRI", code: "FRI" },
    { id: "fte", name: "FAKULTAS TEKNIK ELEKTRO", code: "FTE" },
  ],
  onCategorySelect = (category) => console.log("Selected category:", category),
  onTimelineFilterChange = (filter) => console.log("Timeline filter:", filter),
  onSortChange = (sort) => console.log("Sort changed:", sort),
  onSearch = (query) => console.log("Search:", query),
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [timelineFilter, setTimelineFilter] = useState("Next 7 days");
  const [sortBy, setSortBy] = useState("Sort by dates");

  const timelineFilters: TimelineFilter[] = [
    { label: "Next 7 days", value: "next_7_days" },
    { label: "Next 30 days", value: "next_30_days" },
    { label: "This month", value: "this_month" },
    { label: "All upcoming", value: "all_upcoming" },
  ];

  const sortOptions: TimelineFilter[] = [
    { label: "Sort by dates", value: "dates" },
    { label: "Sort by name", value: "name" },
    { label: "Sort by category", value: "category" },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleTimelineFilterChange = (filter: string) => {
    setTimelineFilter(filter);
    onTimelineFilterChange(filter);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    onSortChange(sort);
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900"></h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto h-full pb-20">
          {/* Course Categories */}
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Course categories
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategorySelect(category)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-800 hover:text-red-700 hover:underline rounded-md transition-colors group"
                >
                  <GraduationCap className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                  <span className="text-sm font-semibold">
                    {category.name} ({category.code})
                  </span>
                </button>
              ))}

              <button
                onClick={() =>
                  onCategorySelect({
                    id: "all",
                    name: "All courses",
                    code: "ALL",
                  })
                }
                className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-900 hover:text-red-700 hover:underline rounded-md transition-colors group"
              >
                <GraduationCap className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                <span className="text-sm font-medium">All courses ...</span>
              </button>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Timeline
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="relative">
                <select
                  value={timelineFilter}
                  onChange={(e) => handleTimelineFilterChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-3 focus:ring-red-100 focus:border-black-500 appearance-none"
                >
                  {timelineFilters.map((filter) => (
                    <option key={filter.value} value={filter.label}>
                      {filter.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-3 focus:ring-red-100 focus:border-black-500 appearance-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by activity type or name"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-3 focus:ring-red-100 focus:border-black-500"
              />
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 text-center">
                No upcoming activities found
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const BlockDrawerToggle: React.FC<{ isOpen: boolean; onClick: () => void }> = ({
  isOpen,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="fixed right-0 top-25 z-30 bg-red-800 hover:bg-red-600 text-white p-3 rounded-l-full shadow-lg transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      style={{
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        minWidth: "48px",
        minHeight: "48px",
      }}
    >
      {isOpen ? (
        <ArrowRight className="w-6 h-6" />
      ) : (
        <ArrowLeft className="w-6 h-6" />
      )}
    </button>
  );
};

const Drawer: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Floating Toggle Button */}
      <BlockDrawerToggle
        isOpen={isDrawerOpen}
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
      />

      {/* Floating Drawer */}
      <BlockDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCategorySelect={(category) => {
          console.log("Selected:", category);
          setIsDrawerOpen(false);
        }}
        onTimelineFilterChange={(filter) =>
          console.log("Timeline filter:", filter)
        }
        onSortChange={(sort) => console.log("Sort:", sort)}
        onSearch={(query) => console.log("Search:", query)}
      />
    </>
  );
};

export default Drawer;
