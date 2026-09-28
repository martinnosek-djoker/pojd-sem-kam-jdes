// Maps a place's long-term rating (1-10) to a medal badge. Below the "bad" threshold,
// shows a no-entry sign instead of a medal. Ratings in between get no badge at all —
// just the plain number, since "meh" doesn't deserve a medal or a ban.
export interface RatingMedal {
  emoji: string;
  label: string;
}

export function getRatingMedal(rating: number | null | undefined): RatingMedal | null {
  if (rating == null) return null;
  if (rating >= 8.5) return { emoji: "🥇", label: "Zlatá medaile" };
  if (rating >= 7) return { emoji: "🥈", label: "Stříbrná medaile" };
  if (rating >= 5.5) return { emoji: "🥉", label: "Bronzová medaile" };
  if (rating < 4) return { emoji: "🚫", label: "Nedoporučujeme" };
  return null;
}
