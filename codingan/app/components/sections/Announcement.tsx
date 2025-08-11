import React from "react";

interface Announcement {
  id: string;
  date: string;
  time: string;
  author: string;
  title: string;
  isClickable?: boolean;
}

interface AnnouncementProps {
  announcements?: Announcement[];
}

const Announcement: React.FC<AnnouncementProps> = ({ announcements }) => {
  const defaultAnnouncements: Announcement[] = [
    {
      id: "1",
      date: "1 July",
      time: "22:25",
      author: "AULIA RAHMAN",
      title: "Maintenance LMS (01 Juli 2025)",
      isClickable: true,
    },
    {
      id: "2",
      date: "3 June",
      time: "21:11",
      author: "HASNAH MUSHAIDAH SOFIA",
      title: "Maintenance LMS (03 Juni 2025) Cancelled TBA",
      isClickable: true,
    },
    {
      id: "3",
      date: "23 May",
      time: "14:47",
      author: "NAJLA NUR ADILA",
      title: "Maintenance Proctoring LMS dan MOOC 22 Mei 2025",
      isClickable: true,
    },
  ];

  const announcementList = announcements || defaultAnnouncements;

  const handleAnnouncementClick = (announcement: Announcement) => {
    if (announcement.isClickable) {
      console.log("Clicked announcement:", announcement.title);
      // Add your click handler logic here
    }
  };

  return (
    <div className="min-h-auto bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Latest announcements
        </h2>
        <div className="bg-white shadow-sm p-6">
          <div className="space-y-2">
            {announcementList.map((announcement) => (
              <div key={announcement.id} className="space-y-1">
                <div className="text-sm text-gray-600">
                  {announcement.date}, {announcement.time}
                </div>
                <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  {announcement.author}
                </div>
                <div>
                  {announcement.isClickable ? (
                    <button
                      onClick={() => handleAnnouncementClick(announcement)}
                      className="text-red-800 hover:text-red-500 text-base font-medium text-left hover:underline"
                    >
                      {announcement.title}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-900">
                      {announcement.title}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <button className="text-base text-red-800 hover:text-red-500 hover:underline">
              Older topics ...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcement;
