// app/listing/create.tsx
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Image, Alert, Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useAuthStore, useLocationStore } from '../../src/stores/authStore';
import { uploadImageToCloudinary } from '../../src/services/cloudinary.service';
import { createListing } from '../../src/services/listings.service';
import { RoomType, Amenity } from '../../src/types/listing.types';

const ROOM_TYPES: RoomType[] = ['bedspace', 'studio', 'apartment'];

const DEFAULT_AMENITIES: Amenity[] = [
  { id: 'kitchen', label: 'Kitchen', value: false },
  { id: 'bathroom', label: 'Bathroom', value: false },
  { id: 'petsAllowed', label: 'Pets Allowed', value: false },
  { id: 'visitorsAllowed', label: 'Visitors Allowed', value: false },
  { id: 'wifi', label: 'WiFi', value: false },
  { id: 'aircon', label: 'Air Conditioning', value: false },
];

export default function CreateListing() {
  const { user } = useAuthStore();
  const { pickedLat, pickedLng, clearPicked } = useLocationStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('bedspace');
  const [address, setAddress] = useState('');

  // Coordinates from pin picker
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [advance, setAdvance] = useState('1');
  const [deposit, setDeposit] = useState('1');
  const [amenities, setAmenities] = useState<Amenity[]>(DEFAULT_AMENITIES);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [hasCurfew, setHasCurfew] = useState(false);
  const [curfewHour, setCurfewHour] = useState('10');
  const [curfewMinute, setCurfewMinute] = useState('00');
  const [curfewPeriod, setCurfewPeriod] = useState<'AM' | 'PM'>('PM');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pick up coordinates whenever user returns from pin picker
  useEffect(() => {
    if (pickedLat !== null && pickedLng !== null) {
      setLatitude(pickedLat);
      setLongitude(pickedLng);
    }
  }, [pickedLat, pickedLng]);

  // Clear picked location when screen unmounts
  useEffect(() => {
    return () => { clearPicked(); };
  }, []);

  const toggleAmenity = (id: string) => {
    setAmenities(prev =>
      prev.map(a => a.id === id ? { ...a, value: !a.value } : a)
    );
  };

  const handleAddCustomAmenity = () => {
    const label = customAmenityInput.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    setAmenities(prev => [...prev, { id, label, value: true }]);
    setCustomAmenityInput('');
    setShowCustomInput(false);
  };

  const handleRemoveAmenity = (id: string) => {
    const isDefault = DEFAULT_AMENITIES.some(a => a.id === id);
    if (isDefault) return;
    setAmenities(prev => prev.filter(a => a.id !== id));
  };

  const handlePickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Maximum 5 photos allowed.');
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Gallery access is needed.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    // Validate all fields clearly
    if (!title.trim()) { setError('Please enter a listing title.'); return; }
    if (!description.trim()) { setError('Please enter a description.'); return; }
    if (!price.trim() || isNaN(Number(price))) { setError('Please enter a valid price.'); return; }
    if (!address.trim()) { setError('Please enter the street address.'); return; }
    if (latitude === null || longitude === null) {
      setError('Please pin your property location on the map.');
      return;
    }
    if (images.length === 0) { setError('Please add at least one photo.'); return; }
    if (!advance.trim() || Number(advance) < 1) { setError('Advance must be at least 1 month.'); return; }
    if (!deposit.trim() || Number(deposit) < 1) { setError('Deposit must be at least 1 month.'); return; }

    setLoading(true);
    setError('');

    try {
      const uploadedUrls: string[] = [];
      for (const uri of images) {
        const url = await uploadImageToCloudinary(uri, 'listings');
        uploadedUrls.push(url);
      }

      const curfewTime = hasCurfew
        ? `${curfewHour}:${curfewMinute} ${curfewPeriod}`
        : '';

      await createListing({
        ownerId: user!.uid,
        ownerName: user!.name,
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        roomType,
        address: address.trim(),
        latitude: latitude!,
        longitude: longitude!,
        images: uploadedUrls,
        amenities,
        advance: Number(advance),
        deposit: Number(deposit),
        hasCurfew,
        curfewTime,
      });

      clearPicked();

      Alert.alert(
        'Listing Submitted',
        'Your listing is under review. It will go live once approved by admin.',
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (e) {
      console.error(e);
      setError('Failed to submit listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Post a Listing</Text>
      <Text style={styles.subtitle}>Fill in your room details below</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Listing Title *</Text>
      <TextInput style={styles.input}
        placeholder="e.g. Affordable Bedspace near NEU"
        placeholderTextColor="#A0AEC0"
        value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Description *</Text>
      <TextInput style={[styles.input, styles.textArea]}
        placeholder="Describe the room, house rules, nearby landmarks..."
        placeholderTextColor="#A0AEC0"
        value={description} onChangeText={setDescription}
        multiline numberOfLines={4} />

      <Text style={styles.label}>Monthly Rent (PHP) *</Text>
      <TextInput style={styles.input} placeholder="e.g. 3500"
        placeholderTextColor="#A0AEC0"
        value={price} onChangeText={setPrice} keyboardType="numeric" />

      {/* Room Type */}
      <Text style={styles.label}>Room Type *</Text>
      <View style={styles.typeRow}>
        {ROOM_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeBtn, roomType === type && styles.typeBtnActive]}
            onPress={() => setRoomType(type)}
          >
            <Text style={[styles.typeBtnText, roomType === type && styles.typeBtnTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Terms */}
      <Text style={styles.sectionTitle}>Terms</Text>
      <View style={styles.termInputRow}>
        <View style={styles.termInputBox}>
          <Text style={styles.label}>Advance (months) *</Text>
          <TextInput style={styles.input} placeholder="e.g. 1"
            placeholderTextColor="#A0AEC0"
            value={advance} onChangeText={setAdvance} keyboardType="numeric" />
        </View>
        <View style={styles.termInputBox}>
          <Text style={styles.label}>Deposit (months) *</Text>
          <TextInput style={styles.input} placeholder="e.g. 1"
            placeholderTextColor="#A0AEC0"
            value={deposit} onChangeText={setDeposit} keyboardType="numeric" />
        </View>
      </View>

      {/* Location */}
      <Text style={styles.sectionTitle}>Location</Text>

      <Text style={styles.label}>Street Address *</Text>
      <TextInput style={styles.input}
        placeholder="e.g. 123 Batangas St, Quezon City"
        placeholderTextColor="#A0AEC0"
        value={address} onChangeText={setAddress} />

      <TouchableOpacity
        style={styles.pinPickerBtn}
        onPress={() => router.push('/listing/pick-location')}
      >
        <Text style={styles.pinPickerBtnText}>
          {latitude !== null && longitude !== null
            ? `Pinned: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            : 'Pin Location on Map *'}
        </Text>
      </TouchableOpacity>

      {latitude !== null && longitude !== null && (
        <Text style={styles.coordsConfirmed}>Location set successfully</Text>
      )}

      {/* Amenities */}
      <Text style={styles.sectionTitle}>Amenities</Text>
      {amenities.map((amenity) => {
        const isCustom = !DEFAULT_AMENITIES.some(a => a.id === amenity.id);
        return (
          <View key={amenity.id} style={styles.switchRow}>
            <Text style={styles.switchLabel}>{amenity.label}</Text>
            <View style={styles.switchRowRight}>
              {isCustom && (
                <TouchableOpacity
                  onPress={() => handleRemoveAmenity(amenity.id)}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              )}
              <Switch
                value={amenity.value}
                onValueChange={() => toggleAmenity(amenity.id)}
                trackColor={{ false: '#CBD5E0', true: '#93C5FD' }}
                thumbColor={amenity.value ? '#3B82F6' : '#fff'}
              />
            </View>
          </View>
        );
      })}

      {showCustomInput ? (
        <View style={styles.customAmenityRow}>
          <TextInput
            style={[styles.input, styles.customAmenityInput]}
            placeholder="e.g. Laundry Area"
            placeholderTextColor="#A0AEC0"
            value={customAmenityInput}
            onChangeText={setCustomAmenityInput}
          />
          <TouchableOpacity style={styles.addAmenityConfirm} onPress={handleAddCustomAmenity}>
            <Text style={styles.addAmenityConfirmText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addAmenityCancelBtn}
            onPress={() => { setShowCustomInput(false); setCustomAmenityInput(''); }}
          >
            <Text style={styles.addAmenityCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addAmenityBtn}
          onPress={() => setShowCustomInput(true)}
        >
          <Text style={styles.addAmenityBtnText}>+ Add Custom Amenity</Text>
        </TouchableOpacity>
      )}

      {/* Curfew */}
      <Text style={styles.sectionTitle}>Curfew</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Has Curfew</Text>
        <Switch
          value={hasCurfew}
          onValueChange={setHasCurfew}
          trackColor={{ false: '#CBD5E0', true: '#93C5FD' }}
          thumbColor={hasCurfew ? '#3B82F6' : '#fff'}
        />
      </View>

      {hasCurfew && (
        <View style={styles.curfewBox}>
          <Text style={styles.label}>Curfew Time</Text>
          <View style={styles.curfewRow}>
            <TextInput
              style={styles.curfewInput}
              value={curfewHour}
              onChangeText={(v) => setCurfewHour(v.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="numeric" maxLength={2}
              placeholder="HH" placeholderTextColor="#A0AEC0"
            />
            <Text style={styles.curfewColon}>:</Text>
            <TextInput
              style={styles.curfewInput}
              value={curfewMinute}
              onChangeText={(v) => setCurfewMinute(v.replace(/[^0-9]/g, '').slice(0, 2))}
              keyboardType="numeric" maxLength={2}
              placeholder="MM" placeholderTextColor="#A0AEC0"
            />
            <View style={styles.periodRow}>
              {(['AM', 'PM'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.periodBtn, curfewPeriod === p && styles.periodBtnActive]}
                  onPress={() => setCurfewPeriod(p)}
                >
                  <Text style={[styles.periodBtnText, curfewPeriod === p && styles.periodBtnTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Photos */}
      <Text style={styles.sectionTitle}>Photos (max 5) *</Text>
      <View style={styles.photoRow}>
        {images.map((uri, index) => (
          <TouchableOpacity
            key={index}
            onLongPress={() => {
              Alert.alert('Remove Photo', 'Remove this photo?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => setImages(images.filter((_, i) => i !== index)) },
              ]);
            }}
          >
            <Image source={{ uri }} style={styles.photo} />
          </TouchableOpacity>
        ))}
        {images.length < 5 && (
          <TouchableOpacity style={styles.addPhoto} onPress={handlePickImage}>
            <Text style={styles.addPhotoIcon}>+</Text>
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.hint}>Long press a photo to remove it.</Text>

      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Submit Listing</Text>
        }
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 52, backgroundColor: '#F5F7FA' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2D3748', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#718096', marginBottom: 24 },
  error: { color: '#E53E3E', marginBottom: 12, fontSize: 13, backgroundColor: '#FFF5F5', padding: 10, borderRadius: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#4A5568', marginBottom: 8 },
  hint: { fontSize: 12, color: '#A0AEC0', marginBottom: 16, fontStyle: 'italic' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2D3748', marginBottom: 14, marginTop: 12 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: '#CBD5E0', padding: 14, fontSize: 15,
    color: '#2D3748', marginBottom: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: {
    flex: 1, padding: 11, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#CBD5E0',
    alignItems: 'center', backgroundColor: '#fff',
  },
  typeBtnActive: { borderColor: '#3B82F6', backgroundColor: '#EBF8FF' },
  typeBtnText: { color: '#718096', fontWeight: '600', fontSize: 13 },
  typeBtnTextActive: { color: '#3B82F6' },
  termInputRow: { flexDirection: 'row', gap: 12 },
  termInputBox: { flex: 1 },
  pinPickerBtn: {
    backgroundColor: '#EBF8FF', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#3B82F6',
    padding: 14, alignItems: 'center', marginBottom: 8,
  },
  pinPickerBtnText: { color: '#3B82F6', fontWeight: '700', fontSize: 14 },
  coordsConfirmed: { color: '#276749', fontSize: 12, marginBottom: 16, textAlign: 'center', fontWeight: '600' },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#EDF2F7',
  },
  switchRowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchLabel: { fontSize: 14, color: '#4A5568', flex: 1 },
  removeBtn: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#FFF5F5', borderRadius: 6 },
  removeBtnText: { color: '#E53E3E', fontSize: 12, fontWeight: '600' },
  addAmenityBtn: {
    marginTop: 14, padding: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#3B82F6',
    borderStyle: 'dashed', alignItems: 'center',
  },
  addAmenityBtnText: { color: '#3B82F6', fontWeight: '600', fontSize: 14 },
  customAmenityRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  customAmenityInput: { flex: 1, marginBottom: 0 },
  addAmenityConfirm: {
    backgroundColor: '#3B82F6', paddingHorizontal: 14,
    paddingVertical: 14, borderRadius: 10,
  },
  addAmenityConfirmText: { color: '#fff', fontWeight: '700' },
  addAmenityCancelBtn: {
    backgroundColor: '#EDF2F7', paddingHorizontal: 14,
    paddingVertical: 14, borderRadius: 10,
  },
  addAmenityCancelText: { color: '#718096', fontWeight: '600' },
  curfewBox: { backgroundColor: '#F7FAFC', borderRadius: 12, padding: 16, marginBottom: 8 },
  curfewRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  curfewInput: {
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1,
    borderColor: '#CBD5E0', padding: 12, fontSize: 18,
    color: '#2D3748', textAlign: 'center', width: 56,
  },
  curfewColon: { fontSize: 22, fontWeight: 'bold', color: '#2D3748' },
  periodRow: { flexDirection: 'row', gap: 6, marginLeft: 8 },
  periodBtn: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#CBD5E0', backgroundColor: '#fff',
  },
  periodBtnActive: { borderColor: '#3B82F6', backgroundColor: '#EBF8FF' },
  periodBtnText: { color: '#718096', fontWeight: '600' },
  periodBtnTextActive: { color: '#3B82F6' },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  photo: { width: 90, height: 90, borderRadius: 10 },
  addPhoto: {
    width: 90, height: 90, borderRadius: 10,
    borderWidth: 2, borderColor: '#CBD5E0',
    borderStyle: 'dashed', justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#fff',
  },
  addPhotoIcon: { fontSize: 24, color: '#A0AEC0' },
  addPhotoText: { fontSize: 11, color: '#A0AEC0', marginTop: 2 },
  btn: {
    backgroundColor: '#3B82F6', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 16,
  },
  btnDisabled: { backgroundColor: '#93C5FD' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});