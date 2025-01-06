import React from 'react';

interface Announcement {
  announcementId: number;
  title: string;
  content: string;
  createdAt: string;
}

interface AnnouncementMarqueeProps {
  announcements: Announcement[];
}

const AnnouncementMarquee: React.FC<AnnouncementMarqueeProps> = ({ announcements }) => {
  if (!announcements || announcements.length === 0) return null;

  return (
    <div className="w-full bg-blue-500 border-t-2 border-b-2 border-blue-700 overflow-hidden">
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap py-2 px-4">
          {announcements.map((announcement) => (
            <span key={announcement.announcementId} className="text-white mx-8">
              <strong>{announcement.title}:</strong> {announcement.content}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementMarquee;

