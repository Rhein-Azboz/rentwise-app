// app/(tabs)/index.tsx
import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import {
  getApprovedListings,
  getOwnerListings,
} from '../../src/services/listings.service';
import { getUserData } from '../../src/services/auth.service';
import { scoreListings } from '../../src/utils/smartMatch';
import { Listing } from '../../src/types/listing.types';
import ListingCard from '../../components/listings/ListingCard';

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    pending:  { bg: '#FEFCBF', text: '#B7791F' },
    approved: { bg: '#C6F6D5', text: '#276749' },
    rejected: { bg: '#FED7D7', text: '#9B2C2C' },
  };
  const c = colors[status] || colors.pending;
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[styles.pillText, { color: c.text }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

export default function HomeTab() {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'owner';

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSmartMatched, setIsSmartMatched] = useState(false);

  const fetchListings = async () => {
    try {
      if (isOwner) {
        const data = await getOwnerListings(user!.uid);
        setListings(data);
      } else {
        const data = await getApprovedListings();

        // Try to smart match if student has preferences set
        const userData = await getUserData(user!.uid);
        if (userData?.preferredRent && userData?.preferredRoomType) {
          const matched = scoreListings(data, {
            preferredRent: userData.preferredRent,
            preferredRoomType: userData.preferredRoomType,
          });
          setListings(matched);
          setIsSmartMatched(true);
        } else {
          setListings(data);
          setIsSmartMatched(false);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.name?.split(' ')[0]}
          </Text>
          <Text style={styles.subtitle}>
            {isOwner
              ? 'Your listings'
              : isSmartMatched
              ? 'Matched to your preferences'
              : 'Rooms near New Era University'}
          </Text>
        </View>
        {isOwner && (
          <TouchableOpacity
            style={styles.postBtn}
            onPress={() => router.push('/listing/create')}
          >
            <Text style={styles.postBtnText}>+ Post</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Smart Match Banner */}
      {isSmartMatched && !isOwner && (
        <View style={styles.smartBanner}>
          <Text style={styles.smartBannerText}>
            Listings sorted by your budget and room preference
          </Text>
        </View>
      )}

      <FlatList
        data={listings}
        keyExtractor={(item) => item.listingId}
        renderItem={({ item }) => (
          <View>
            {isOwner && <StatusPill status={item.status} />}
            <ListingCard listing={item} />
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchListings(); }}
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {isOwner ? 'No listings yet' : 'No rooms available'}
            </Text>
            <Text style={styles.emptySub}>
              {isOwner
                ? 'Tap "+ Post" to add your first listing'
                : 'Check back soon for rooms near NEU'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
    paddingTop: 56, paddingBottom: 16, backgroundColor: '#F5F7FA',
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#2D3748' },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
  postBtn: {
    backgroundColor: '#3B82F6', paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 10,
  },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  smartBanner: {
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: '#EBF8FF', borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: '#BEE3F8',
  },
  smartBannerText: { color: '#2B6CB0', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  pill: {
    alignSelf: 'flex-start', paddingHorizontal: 10,
    paddingVertical: 3, borderRadius: 20, marginBottom: 6,
  },
  pillText: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', paddingHorizontal: 20 },
});