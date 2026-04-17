// app/(auth)/student-setup.tsx
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { useAuthStore } from '../../src/stores/authStore';

const ROOM_TYPES = ['bedspace', 'studio', 'apartment'];

export default function StudentSetup() {
  const { user } = useAuthStore();
  const [age, setAge] = useState('');
  const [contact, setContact] = useState('');
  const [budget, setBudget] = useState('');
  const [roomType, setRoomType] = useState('single');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!age || !contact || !budget) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        age: Number(age),
        contactNumber: contact,
        preferredRent: Number(budget),
        preferredRoomType: roomType,
      });
      router.replace('/(tabs)');
    } catch (e) {
      setError('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Help us find the best listings for you</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 20"
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

      <Text style={styles.label}>Max Monthly Budget (PHP)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 5000"
        placeholderTextColor="#A0AEC0"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Preferred Room Type</Text>
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

      <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Finish Setup</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 28, paddingVertical: 52, backgroundColor: '#F5F7FA' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2D3748', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#718096', marginBottom: 28 },
  error: { color: '#E53E3E', marginBottom: 12, fontSize: 13 },
  label: { fontSize: 13, fontWeight: '600', color: '#4A5568', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: '#CBD5E0', padding: 14, fontSize: 15,
    color: '#2D3748', marginBottom: 18,
  },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  typeBtn: {
    flex: 1, padding: 11, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#CBD5E0',
    alignItems: 'center', backgroundColor: '#fff',
  },
  typeBtnActive: { borderColor: '#3B82F6', backgroundColor: '#EBF8FF' },
  typeBtnText: { color: '#718096', fontWeight: '600', fontSize: 13 },
  typeBtnTextActive: { color: '#3B82F6' },
  btn: {
    backgroundColor: '#3B82F6', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});