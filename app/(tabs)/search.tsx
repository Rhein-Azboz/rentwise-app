// app/(tabs)/search.tsx
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { getApprovedListings } from '../../src/services/listings.service';
import { Listing, RoomType } from '../../src/types/listing.types';
import ListingCard from '../../components/listings/ListingCard';

const ROOM_TYPES: { label: string; value: RoomType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Bedspace', value: 'bedspace' },
  { label: 'Studio', value: 'studio' },
  { label: 'Apartment', value: 'apartment' },
];

const DISTANCE_OPTIONS = [
  { label: 'Any', value: 999 },
  { label: '1 km', value: 1 },
  { label: '3 km', value: 3 },
  { label: '5 km', value: 5 },
];

export default function SearchScreen() {
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [roomType, setRoomType] = useState<RoomType | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxDistance, setMaxDistance] = useState(999);

  useEffect(() => {
    const fetch = async () => {
      const data = await getApprovedListings();
      setAllListings(data);
      setResults(data);
      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    let filtered = [...allListings];

    // Text search
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q)
      );
    }

    // Room type
    if (roomType !== 'all') {
      filtered = filtered.filter(l => l.roomType === roomType);
    }

    // Max price
    if (maxPrice && Number(maxPrice) > 0) {
      filtered = filtered.filter(l => l.price <= Number(maxPrice));
    }

    // Max distance
    filtered = filtered.filter(l => l.distanceFromNEU <= maxDistance);

    setResults(filtered);
  }, [searchText, roomType, maxPrice, maxDistance, allListings]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Search Listings</Text>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title or address..."
            placeholderTextColor="#A0AEC0"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Room Type Filter */}
        <Text style={styles.filterLabel}>Room Type</Text>
        <View style={styles.filterRow}>
          {ROOM_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={[styles.filterChip, roomType === t.value && styles.filterChipActive]}
              onPress={() => setRoomType(t.value)}
            >
              <Text style={[styles.filterChipText, roomType === t.value && styles.filterChipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Max Price */}
        <Text style={styles.filterLabel}>Max Price (PHP)</Text>
        <TextInput
          style={styles.priceInput}
          placeholder="e.g. 5000 (leave blank for any)"
          placeholderTextColor="#A0AEC0"
          value={maxPrice}
          onChangeText={setMaxPrice}
          keyboardType="numeric"
        />

        {/* Distance Filter */}
        <Text style={styles.filterLabel}>Distance from NEU</Text>
        <View style={styles.filterRow}>
          {DISTANCE_OPTIONS.map((d) => (
            <TouchableOpacity
              key={d.value}
              style={[styles.filterChip, maxDistance === d.value && styles.filterChipActive]}
              onPress={() => setMaxDistance(d.value)}
            >
              <Text style={[styles.filterChipText, maxDistance === d.value && styles.filterChipTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Result Count */}
        <Text style={styles.resultCount}>
          {results.length} listing{results.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.listingId}
          renderItem={({ item }) => <ListingCard listing={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No listings found</Text>
              <Text style={styles.emptySub}>Try adjusting your filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8, backgroundColor: '#F5F7FA' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2D3748', marginBottom: 14 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#CBD5E0',
    paddingHorizontal: 14, marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#2D3748', paddingVertical: 13 },
  clearBtn: { fontSize: 16, color: '#A0AEC0', padding: 4 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#718096', marginBottom: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: '#CBD5E0', backgroundColor: '#fff',
  },
  filterChipActive: { borderColor: '#3B82F6', backgroundColor: '#EBF8FF' },
  filterChipText: { fontSize: 13, color: '#718096', fontWeight: '600' },
  filterChipTextActive: { color: '#3B82F6' },
  priceInput: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: '#CBD5E0', padding: 12, fontSize: 14,
    color: '#2D3748', marginBottom: 14,
  },
  resultCount: { fontSize: 13, color: '#A0AEC0', marginBottom: 8 },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#2D3748', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#A0AEC0' },
});