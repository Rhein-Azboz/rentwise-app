// app/listing/pick-location.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { router } from 'expo-router';
import { useLocationStore } from '../../src/stores/authStore';

const NEU_LAT = 14.6637;
const NEU_LNG = 121.0581;

export default function PickLocation() {
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const { setPicked } = useLocationStore();

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setPin({ lat: latitude, lng: longitude });
  };

  const handleConfirm = () => {
    if (!pin) return;
    // Store coordinates in global store
    setPicked(pin.lat, pin.lng);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          {pin
            ? `Pin dropped at ${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`
            : 'Tap on the map to drop a pin on your property'}
        </Text>
      </View>

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: NEU_LAT,
          longitude: NEU_LNG,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        {/* NEU Marker */}
        <Marker
          coordinate={{ latitude: NEU_LAT, longitude: NEU_LNG }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.neuMarker}>
            <Text style={styles.neuMarkerText}>NEU</Text>
          </View>
        </Marker>

        {/* Dropped Pin */}
        {pin && (
          <Marker
            coordinate={{ latitude: pin.lat, longitude: pin.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.pin}>
              <View style={styles.pinDot} />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, !pin && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!pin}
        >
          <Text style={styles.confirmText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    position: 'absolute', top: 52, left: 16, right: 16,
    zIndex: 10, backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  bannerText: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  map: { flex: 1 },
  neuMarker: {
    backgroundColor: '#2D3748', paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 8,
    borderWidth: 2, borderColor: '#fff',
  },
  neuMarkerText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  pin: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(59,130,246,0.3)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#3B82F6',
  },
  pinDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 12, padding: 16,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#CBD5E0', alignItems: 'center',
  },
  cancelText: { color: '#4A5568', fontWeight: '600' },
  confirmBtn: {
    flex: 2, padding: 14, borderRadius: 12,
    backgroundColor: '#3B82F6', alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#93C5FD' },
  confirmText: { color: '#fff', fontWeight: '700' },
});