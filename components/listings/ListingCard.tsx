// components/listings/ListingCard.tsx
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Listing } from '../../src/types/listing.types';
import { formatPHP } from '../../src/utils/formatCurrency';

type Props = { listing: Listing };

export default function ListingCard({ listing }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/listing/${listing.listingId}`)}
      activeOpacity={0.92}
    >
      {/* Listing Image */}
      <Image
        source={
          listing.images.length > 0
            ? { uri: listing.images[0] }
            : require('../../assets/icon.png')
        }
        style={styles.image}
      />

      {/* Room type badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {listing.roomType.charAt(0).toUpperCase() + listing.roomType.slice(1)}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.address} numberOfLines={1}>{listing.address}</Text>

        <View style={styles.row}>
          <Text style={styles.price}>{formatPHP(listing.price)}/mo</Text>
          <Text style={styles.distance}>{listing.distanceFromNEU} km from NEU</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  image: { width: '100%', height: 180, backgroundColor: '#E2E8F0' },
  badge: {
    position: 'absolute',
    top: 12, left: 12,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  info: { padding: 14 },
  title: { fontSize: 16, fontWeight: '700', color: '#2D3748', marginBottom: 4 },
  address: { fontSize: 13, color: '#718096', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '800', color: '#3B82F6' },
  distance: { fontSize: 12, color: '#A0AEC0' },
});