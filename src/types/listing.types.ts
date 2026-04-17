// src/types/listing.types.ts
export type RoomType = 'bedspace' | 'studio' | 'apartment';

export type ListingStatus = 'pending' | 'approved' | 'rejected';

export type Amenity = {
  id: string;
  label: string;
  value: boolean;
};

export type Listing = {
  listingId: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  price: number;
  roomType: RoomType;
  address: string;
  latitude: number;
  longitude: number;
  distanceFromNEU: number;
  images: string[];
  amenities: Amenity[];
  advance: number;
  deposit: number;
  hasCurfew: boolean;
  curfewTime: string;
  status: ListingStatus;
  averageRating: number;
  reviewCount: number;
  createdAt: any;
};