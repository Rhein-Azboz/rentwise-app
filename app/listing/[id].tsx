// app/listing/[id].tsx
import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
  ActivityIndicator, TouchableOpacity, Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getListingById } from '../../src/services/listings.service';
import { Listing } from '../../src/types/listing.types';
import { formatPHP } from '../../src/utils/formatCurrency';

const { width } = Dimensions.get('window');

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const data = await getListingById(id);
      setListing(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Listing not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Image Carousel */}
        <ScrollView
          horizontal pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveImage(index);
          }}
        >
          {listing.images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.image} />
          ))}
        </ScrollView>

        {/* Dot indicators */}
        {listing.images.length > 1 && (
          <View style={styles.dots}>
            {listing.images.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
            ))}
          </View>
        )}

        <View style={styles.content}>

          {/* Header */}
          <View style={styles.rowBetween}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {listing.roomType.charAt(0).toUpperCase() + listing.roomType.slice(1)}
              </Text>
            </View>
            <Text style={styles.distance}>{listing.distanceFromNEU} km from NEU</Text>
          </View>

          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.address}>{listing.address}</Text>

          {/* Price */}
          <View style={styles.priceBox}>
            <Text style={styles.price}>{formatPHP(listing.price)}</Text>
            <Text style={styles.priceSub}>/month</Text>
          </View>

          {/* Advance & Deposit */}
<View style={styles.termRow}>
  <View style={styles.termBox}>
    <Text style={styles.termLabel}>Advance</Text>
    <Text style={styles.termValue}>{listing.advance} month{listing.advance > 1 ? 's' : ''}</Text>
  </View>
  <View style={styles.termBox}>
    <Text style={styles.termLabel}>Deposit</Text>
    <Text style={styles.termValue}>{listing.deposit} month{listing.deposit > 1 ? 's' : ''}</Text>
  </View>
  {listing.hasCurfew && (
    <View style={styles.termBox}>
      <Text style={styles.termLabel}>Curfew</Text>
      <Text style={styles.termValue}>{listing.curfewTime}</Text>
    </View>
  )}
</View>

          {/* Description */}
          <Text style={styles.sectionTitle}>About this place</Text>
          <Text style={styles.description}>{listing.description}</Text>

          {/* Amenities */}
<Text style={styles.sectionTitle}>Amenities</Text>
<View style={styles.amenitiesGrid}>
  {(() => {
    const amenitiesArray = Object.entries(listing?.amenities || {})
      .filter(([_, value]) => value)
      .map(([key]) => key);

    const labelMap: Record<string, string> = {
      kitchen: "Kitchen",
      bathroom: "Bathroom",
      petsAllowed: "Pets Allowed",
      visitorsAllowed: "Visitors Allowed",
      curfew: "Curfew",
    };

    if (amenitiesArray.length === 0) {
      return (
        <Text style={{ color: '#A0AEC0', fontSize: 13 }}>
          No amenities listed
        </Text>
      );
    }

    return amenitiesArray.map((key) => (
      <View key={key} style={styles.amenityChip}>
        <Text style={styles.amenityText}>
          {labelMap[key] || key}
        </Text>
      </View>
    ));
  })()}
</View>


          {/* Owner */}
          <Text style={styles.sectionTitle}>Posted by</Text>
          <Text style={styles.owner}>{listing.ownerName}</Text>

        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
<View style={styles.bottomBar}>
  <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
    <Text style={styles.backBtnText}>Back</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.chatBtn}
    onPress={() => router.push({
      pathname: '/schedule/request',
      params: {
        listingId: listing.listingId,
        listingTitle: listing.title,
        ownerId: listing.ownerId,
      },
    })}
  >
    <Text style={styles.chatBtnText}>Request Viewing</Text>
  </TouchableOpacity>
</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 16, color: '#718096' },
  image: { width, height: 260, backgroundColor: '#E2E8F0' },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#CBD5E0' },
  dotActive: { backgroundColor: '#3B82F6' },
  content: { padding: 20 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { backgroundColor: '#EBF8FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#3B82F6', fontWeight: '700', fontSize: 12 },
  distance: { fontSize: 12, color: '#A0AEC0' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2D3748', marginBottom: 4 },
  address: { fontSize: 13, color: '#718096', marginBottom: 16 },
  priceBox: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  price: { fontSize: 28, fontWeight: '800', color: '#3B82F6' },
  priceSub: { fontSize: 14, color: '#A0AEC0', marginLeft: 4, marginBottom: 3 },
  termRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  termBox: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  termLabel: { fontSize: 11, color: '#A0AEC0', marginBottom: 4 },
  termValue: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2D3748', marginBottom: 10, marginTop: 4 },
  description: { fontSize: 14, color: '#4A5568', lineHeight: 22, marginBottom: 20 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  amenityChip: {
    backgroundColor: '#EBF8FF', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
  },
  amenityChipOff: { backgroundColor: '#F7FAFC' },
  amenityText: { fontSize: 12, color: '#3B82F6', fontWeight: '600' },
  amenityTextOff: { color: '#CBD5E0' },
  owner: { fontSize: 14, color: '#4A5568', marginBottom: 100 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12, padding: 16,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  backBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#CBD5E0', alignItems: 'center',
  },
  backBtnText: { color: '#4A5568', fontWeight: '600' },
  chatBtn: {
    flex: 2, padding: 14, borderRadius: 12,
    backgroundColor: '#3B82F6', alignItems: 'center',
  },
  chatBtnText: { color: '#fff', fontWeight: '700' },
});