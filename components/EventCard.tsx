import { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const formatEventDate = () => {
    if (event.start_date && event.end_date) {
      const start = new Date(event.start_date);
      const end = new Date(event.end_date);

      const startDate = start.toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "numeric"
      });
      const endDate = end.toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "numeric"
      });

      if (startDate === endDate) {
        return startDate;
      }
      return `${startDate} - ${endDate}`;
    }

    // Fallback to legacy date field
    return event.date || "";
  };

  const dateDisplay = formatEventDate();

  const CardContent = () => (
    <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
      {/* Date section */}
      {dateDisplay && (
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-purple-600/20 border border-purple-500/30 rounded-lg p-2 sm:p-3 md:p-4 w-[90px] sm:w-[110px] md:w-[130px]">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs sm:text-sm text-purple-300 font-semibold text-center leading-tight">
            {dateDisplay}
          </span>
        </div>
      )}

      {/* Content section */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base sm:text-lg md:text-2xl font-bold text-purple-300 mb-1 sm:mb-2 tracking-wide group-hover:text-purple-200 transition-colors">
          {event.name}
        </h3>

        {event.location && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm sm:text-base text-gray-300 truncate">{event.location}</span>
          </div>
        )}
      </div>

      {/* Link icon indicator */}
      {event.link && (
        <div className="flex-shrink-0 bg-purple-600/80 backdrop-blur-sm rounded-full p-2 sm:p-2.5 md:p-3">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      )}
    </div>
  );

  if (event.link) {
    return (
      <a
        href={event.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-xl shadow-purple-900/10 hover:shadow-purple-600/20 transition-all duration-300 p-6 border border-purple-600/20 hover:border-purple-500/40 group relative overflow-hidden cursor-pointer hover:scale-[1.02]"
      >
        <CardContent />
      </a>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-xl shadow-purple-900/10 transition-all duration-300 p-6 border border-purple-600/20 group relative overflow-hidden">
      <CardContent />
    </div>
  );
}
