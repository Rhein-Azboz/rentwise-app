// app/(tabs)/map.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { router } from 'expo-router';
import { getApprovedListings } from '../../src/services/listings.service';
import { Listing } from '../../src/types/listing.types';
import { formatPHP } from '../../src/utils/formatCurrency';

const NEU_LAT = 14.6637;
const NEU_LNG = 121.0581;

export default function MapScreen() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Listing | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getApprovedListings();
      setListings(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: NEU_LAT,
          longitude: NEU_LNG,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* NEU Marker */}
        <Marker
          coordinate={{ latitude: NEU_LAT, longitude: NEU_LNG }}
          anchor={{ x: 0.5, y: 0.8 }}
        >
          <View style={styles.neuMarker}>
            <Text style={styles.neuMarkerText}>NEU</Text>
          </View>
        </Marker>

        {/* Listing Markers */}
        {listings.map((listing) => (
          <Marker
            key={listing.listingId}
            coordinate={{
              latitude: listing.latitude,
              longitude: listing.longitude,
            }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() =>
              setSelected(
                selected?.listingId === listing.listingId ? null : listing
              )
            }
          >
            <View
              style={[
                styles.pin,
                selected?.listingId === listing.listingId &&
                  styles.pinSelected,
              ]}
            >
              <Text style={styles.pinText}>
                {formatPHP(listing.price)}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Preview Card */}
      {selected && (
        <TouchableOpacity
          style={styles.previewCard}
          onPress={() =>
            router.push(`/listing/${selected.listingId}`)
          }
          activeOpacity={0.92}
        >
          <View style={styles.previewContent}>
            <View>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {selected.title}
              </Text>
              <Text style={styles.previewAddress} numberOfLines={1}>
                {selected.address}
              </Text>
              <Text style={styles.previewDistance}>
                {selected.distanceFromNEU} km from NEU
              </Text>
            </View>

            <View style={styles.previewRight}>
              <Text style={styles.previewPrice}>
                {formatPHP(selected.price)}
              </Text>
              <Text style={styles.previewPriceSub}>/mo</Text>
              <Text style={styles.viewDetails}>View →</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Count Label */}
      <View style={styles.mapLabel}>
        <Text style={styles.mapLabelText}>
          {listings.length} listing
          {listings.length !== 1 ? 's' : ''} near NEU
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: { flex: 1 },

  /* NEU MARKER */
  neuMarker: {
    backgroundColor: '#2D3748',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  neuMarkerText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },

  /* LISTING PIN (FIXED - NO CLIPPING) */
  pin: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,

    borderWidth: 2,
    borderColor: '#fff',

    alignItems: 'center',
    justifyContent: 'center',

    minWidth: 60,

    // IMPORTANT FIXES FOR EXPO + ANDROID
    overflow: 'visible',
  },

  pinSelected: {
    backgroundColor: '#1D4ED8',
    borderWidth: 3,
    borderColor: '#FACC15',
  },

  pinText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,

    includeFontPadding: false, // Android fix
    textAlignVertical: 'center',
  },

  /* PREVIEW CARD */
  previewCard: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },

  previewContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3748',
    maxWidth: 200,
  },

  previewAddress: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
    maxWidth: 200,
  },

  previewDistance: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
    fontWeight: '600',
  },

  previewRight: {
    alignItems: 'flex-end',
  },

  previewPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3B82F6',
  },

  previewPriceSub: {
    fontSize: 11,
    color: '#A0AEC0',
  },

  viewDetails: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '700',
    marginTop: 6,
  },

  /* TOP LABEL */
  mapLabel: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  mapLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
