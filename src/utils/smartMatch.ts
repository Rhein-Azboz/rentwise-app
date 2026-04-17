// src/utils/smartMatch.ts
import { Listing } from '../types/listing.types';

type UserPreferences = {
  preferredRent: number;
  preferredRoomType: string;
};

/**
 * Scores each listing based on student preferences.
 * Higher score = better match.
 */
export function scoreListings(
  listings: Listing[],
  prefs: UserPreferences
): Listing[] {
  const scored = listings.map((listing) => {
    let score = 0;

    // Budget match — within budget gets +3, slightly over gets +1
    if (listing.price <= prefs.preferredRent) {
      score += 3;
    } else if (listing.price <= prefs.preferredRent * 1.2) {
      score += 1; // Within 20% over budget still shown
    }

    // Room type match
    if (listing.roomType === prefs.preferredRoomType) {
      score += 2;
    }

    // Distance bonus — closer = higher score
    if (listing.distanceFromNEU <= 1) score += 3;
    else if (listing.distanceFromNEU <= 3) score += 2;
    else if (listing.distanceFromNEU <= 5) score += 1;

    return { listing, score };
  });

  // Sort by score descending, then distance ascending as tiebreaker
  return scored
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : a.listing.distanceFromNEU - b.listing.distanceFromNEU
    )
    .map((s) => s.listing);
}