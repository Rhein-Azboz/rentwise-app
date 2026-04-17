// app/schedule/request.tsx
import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { requestViewing } from '../../src/services/schedule.service';

const TIMES = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM',
];

// Generate next 14 days as selectable dates
function getNext14Days(): { label: string; value: string }[] {
  const days = [];
  for (let i = 1; i <= 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push({
      label: date.toLocaleDateString('en-PH', {
        weekday: 'short', month: 'short', day: 'numeric',
      }),
      value: date.toISOString().split('T')[0],
    });
  }
  return days;
}

export default function RequestViewing() {
  const { user } = useAuthStore();
  const { listingId, listingTitle, ownerId } =
    useLocalSearchParams<{
      listingId: string;
      listingTitle: string;
      ownerId: string;
    }>();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dates = getNext14Days();

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Please select both a date and time.');
      return;
    }

    setLoading(true);
    try {
      await requestViewing({
        studentId: user!.uid,
        studentName: user!.name,
        ownerId,
        listingId,
        listingTitle,
        proposedDate: selectedDate,
        proposedTime: selectedTime,
      });

      Alert.alert(
        'Viewing Requested',
        'The owner will be notified and will confirm or decline your request.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Request a Viewing</Text>
      <Text style={styles.subtitle} numberOfLines={2}>{listingTitle}</Text>

      {/* Date Picker */}
      <Text style={styles.sectionTitle}>Select a Date</Text>
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.dateScroll}
      >
        {dates.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[styles.dateChip, selectedDate === d.value && styles.dateChipActive]}
            onPress={() => setSelectedDate(d.value)}
          >
            <Text style={[styles.dateChipText, selectedDate === d.value && styles.dateChipTextActive]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Time Picker */}
      <Text style={styles.sectionTitle}>Select a Time</Text>
      <View style={styles.timeGrid}>
        {TIMES.map((time) => (
          <TouchableOpacity
            key={time}
            style={[styles.timeChip, selectedTime === time && styles.timeChipActive]}
            onPress={() => setSelectedTime(time)}
          >
            <Text style={[styles.timeChipText, selectedTime === time && styles.timeChipTextActive]}>
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      {selectedDate && selectedTime && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Your Request</Text>
          <Text style={styles.summaryText}>
            {dates.find(d => d.value === selectedDate)?.label} at {selectedTime}
          </Text>
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.btn, (!selectedDate || !selectedTime || loading) && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={!selectedDate || !selectedTime || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Send Request</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 52, backgroundColor: '#F5F7FA' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2D3748', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#718096', marginBottom: 28, lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#2D3748', marginBottom: 12 },
  dateScroll: { marginBottom: 24 },
  dateChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: '#CBD5E0', backgroundColor: '#fff',
    marginRight: 10,
  },
  dateChipActive: { borderColor: '#3B82F6', backgroundColor: '#EBF8FF' },
  dateChipText: { fontSize: 13, color: '#718096', fontWeight: '600' },
  dateChipTextActive: { color: '#3B82F6' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  timeChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: '#CBD5E0', backgroundColor: '#fff',
  },
  timeChipActive: { borderColor: '#3B82F6', backgroundColor: '#EBF8FF' },
  timeChipText: { fontSize: 13, color: '#718096', fontWeight: '600' },
  timeChipTextActive: { color: '#3B82F6' },
  summaryBox: {
    backgroundColor: '#EBF8FF', borderRadius: 12,
    padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: '#BEE3F8',
  },
  summaryTitle: { fontSize: 12, color: '#2B6CB0', fontWeight: '700', marginBottom: 4 },
  summaryText: { fontSize: 16, color: '#2B6CB0', fontWeight: '800' },
  btn: {
    backgroundColor: '#3B82F6', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  btnDisabled: { backgroundColor: '#93C5FD' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelText: { color: '#718096', fontWeight: '600', fontSize: 15 },
});