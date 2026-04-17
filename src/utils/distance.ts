// src/utils/distance.ts

// NEU coordinates (from blueprint)
const NEU_LAT = 14.6537;
const NEU_LNG = 121.0328;

/**
 * Haversine formula — calculates straight-line distance
 * between two GPS coordinates in kilometers.
 */
export function getDistanceFromNEU(lat: number, lng: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat - NEU_LAT);
  const dLng = toRad(lng - NEU_LNG);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(NEU_LAT)) *
      Math.cos(toRad(lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}