// app/(auth)/owner-setup.tsx
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
  Image, Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { useAuthStore } from '../../src/stores/authStore';
import { uploadImageToCloudinary } from '../../src/services/cloudinary.service';

export default function OwnerSetup() {
  const { user } = useAuthStore();
  const [age, setAge] = useState('');
  const [contact, setContact] = useState('');
  const [idImage, setIdImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Pick image from gallery or camera
  const handlePickImage = async () => {
    Alert.alert(
      'Upload Valid ID',
      'Choose a method',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Permission required', 'Camera access is needed to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled) {
              setIdImage(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              Alert.alert('Permission required', 'Gallery access is needed.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled) {
              setIdImage(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Step 2: Upload to Cloudinary + save to Firestore
  const handleSubmit = async () => {
    if (!age || !contact) {
      setError('Please fill in all fields.');
      return;
    }
    if (!idImage) {
      setError('Please upload a valid ID photo.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload ID image to Cloudinary under 'ids' folder
      setUploading(true);
      const idUrl = await uploadImageToCloudinary(idImage, 'ids');
      setUploading(false);

      // Save all owner details to Firestore
      await updateDoc(doc(db, 'users', user!.uid), {
        age: Number(age),
        contactNumber: contact,
        validIdUrl: idUrl,
        verificationStatus: 'pending',
        isVerified: false,
      });

      // Go to pending screen
      router.replace('/(auth)/owner-pending');

    } catch (e) {
      setError('Something went wrong. Please try again.');
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Owner Verification</Text>
      <Text style={styles.subtitle}>
        Complete your profile and upload a valid ID to get verified.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 35"
        placeholderTextColor="#A0AEC0"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Contact Number</Text>
      <TextInput
        style={styles.input}
        placeholder="+63 9XX XXX XXXX"
        placeholderTextColor="#A0AEC0"
        value={contact}
        onChangeText={setContact}
        keyboardType="phone-pad"
      />

      {/* ID Upload Section */}
      <Text style={styles.label}>Valid ID Photo</Text>
      <Text style={styles.hint}>
        Accepted: Government ID, Driver's License, Passport, School ID
      </Text>

      <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage}>
        {idImage ? (
          <Image source={{ uri: idImage }} style={styles.idPreview} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Text style={styles.uploadIcon}>+</Text>
            <Text style={styles.uploadText}>Tap to upload ID</Text>
          </View>
        )}
      </TouchableOpacity>

      {idImage && (
        <TouchableOpacity onPress={handlePickImage}>
          <Text style={styles.changePhoto}>Change photo</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.btn, (loading || uploading) && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={loading || uploading}
      >
        {uploading ? (
          <>
            <ActivityIndicator color="#fff" />
            <Text style={styles.btnText}>  Uploading ID...</Text>
          </>
        ) : loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Submit for Verification</Text>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, paddingHorizontal: 28,
    paddingVertical: 52, backgroundColor: '#F5F7FA',
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2D3748', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#718096', marginBottom: 28, lineHeight: 22 },
  error: { color: '#E53E3E', marginBottom: 12, fontSize: 13 },
  label: { fontSize: 13, fontWeight: '600', color: '#4A5568', marginBottom: 8 },
  hint: { fontSize: 12, color: '#A0AEC0', marginBottom: 12 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: '#CBD5E0', padding: 14, fontSize: 15,
    color: '#2D3748', marginBottom: 18,
  },
  uploadBox: {
    width: '100%', height: 200, borderRadius: 12,
    borderWidth: 2, borderColor: '#CBD5E0',
    borderStyle: 'dashed', overflow: 'hidden',
    marginBottom: 12, backgroundColor: '#fff',
  },
  uploadPlaceholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  uploadIcon: { fontSize: 36, color: '#A0AEC0', marginBottom: 8 },
  uploadText: { fontSize: 14, color: '#A0AEC0' },
  idPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  changePhoto: {
    color: '#3B82F6', fontSize: 13,
    textAlign: 'center', marginBottom: 24,
  },
  btn: {
    backgroundColor: '#3B82F6', borderRadius: 12, padding: 16,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: { backgroundColor: '#93C5FD' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});