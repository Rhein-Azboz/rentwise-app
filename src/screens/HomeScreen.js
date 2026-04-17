// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { UNIVERSITIES } from '../constants/universities';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function HomeScreen() {
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [dbStatus, setDbStatus] = useState('Connecting...');

  useEffect(() => {
  const testConnection = async () => {
    try {
      // Test Firebase
      await getDocs(collection(db, 'test'));

      // Test Cloudinary reachability
      const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'OPTIONS' }
      );

      setDbStatus('Firebase + Cloudinary connected');
    } catch (error) {
      setDbStatus('Error: ' + error.message);
    }
  };
  testConnection();
}, []);

  const selectedUni = UNIVERSITIES.find(u => u.id === selectedUniversity);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RentWise</Text>
      <Text style={styles.subtitle}>Find rooms near your university</Text>

      {/* Firebase status indicator */}
      <Text style={styles.status}>{dbStatus}</Text>

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Select your university</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={selectedUniversity}
            onValueChange={(itemValue) => setSelectedUniversity(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="-- Choose a university --" value={null} />
            {UNIVERSITIES.map((uni) => (
              <Picker.Item key={uni.id} label={uni.name} value={uni.id} />
            ))}
          </Picker>
        </View>
      </View>

      {selectedUni && (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmText}>
            Searching near {selectedUni.name}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 8,
    marginBottom: 12,
  },
  status: {
    fontSize: 12,
    color: '#48BB78',
    marginBottom: 28,
  },
  pickerWrapper: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  pickerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 180 : 52,
  },
  confirmBox: {
    marginTop: 20,
    backgroundColor: '#EBF8FF',
    borderRadius: 10,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BEE3F8',
  },
  confirmText: {
    color: '#2B6CB0',
    fontWeight: '600',
    fontSize: 14,
  },
});