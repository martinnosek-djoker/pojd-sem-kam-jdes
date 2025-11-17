import { Event } from "@/lib/types";

interface EventCardProps {
  event: Event;
}

export default function EventCard({ event }: EventCardProps) {
  const CardContent = () => (
    <div className="flex items-center gap-6 md:gap-8">
      {/* Date section */}
      {event.date && (
        <div className="flex-shrink-0 flex flex-col items-center justify-center bg-purple-600/20 border border-purple-500/30 rounded-lg p-4 min-w-[120px]">
          <span className="text-2xl mb-1">📅</span>
          <span className="text-sm text-purple-300 font-semibold text-center leading-tight">
            {event.date}
          </span>
        </div>
      )}

      {/* Content section */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl md:text-2xl font-bold text-purple-300 mb-2 tracking-wide group-hover:text-purple-200 transition-colors">
          {event.name}
        </h3>

        {event.location && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📍</span>
            <span className="text-gray-300">{event.location}</span>
          </div>
        )}
      </div>

      {/* Link icon indicator */}
      {event.link && (
        <div className="flex-shrink-0 bg-purple-600/80 backdrop-blur-sm rounded-full p-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
