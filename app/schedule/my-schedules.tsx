// app/schedule/my-schedules.tsx
import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { useAuthStore } from '../../src/stores/authStore';
import {
  getStudentSchedules,
  getOwnerSchedules,
  updateScheduleStatus,
} from '../../src/services/schedule.service';
import { ViewingSchedule } from '../../src/types/schedule.types';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: '#FEFCBF', text: '#B7791F' },
  accepted:  { bg: '#C6F6D5', text: '#276749' },
  rejected:  { bg: '#FED7D7', text: '#9B2C2C' },
  cancelled: { bg: '#E2E8F0', text: '#718096' },
};

export default function MySchedules() {
  const { user } = useAuthStore();
  const isOwner = user?.role === 'owner';

  const [schedules, setSchedules] = useState<ViewingSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    try {
      const data = isOwner
        ? await getOwnerSchedules(user!.uid)
        : await getStudentSchedules(user!.uid);
      setSchedules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleAction = async (
    scheduleId: string,
    action: 'accepted' | 'rejected' | 'cancelled',
    label: string
  ) => {
    Alert.alert(
      `${label} Viewing`,
      `Are you sure you want to ${label.toLowerCase()} this viewing request?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: action === 'cancelled' || action === 'rejected' ? 'destructive' : 'default',
          onPress: async () => {
            await updateScheduleStatus(scheduleId, action);
            fetchSchedules();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isOwner ? 'Viewing Requests' : 'My Schedules'}
      </Text>

      <FlatList
        data={schedules}
        keyExtractor={(item) => item.scheduleId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No schedules yet</Text>
            <Text style={styles.emptySub}>
              {isOwner
                ? 'Viewing requests from students will appear here'
                : 'Request a viewing from a listing to get started'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const c = STATUS_COLORS[item.status];
          return (
            <View style={styles.card}>
              {/* Listing Title */}
              <Text style={styles.listingTitle} numberOfLines={1}>
                {item.listingTitle}
              </Text>

              {/* Who */}
              <Text style={styles.meta}>
                {isOwner ? `Student: ${item.studentName}` : `Listing ID: ${item.listingId}`}
              </Text>

              {/* Date & Time */}
              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeBox}>
                  <Text style={styles.dateTimeLabel}>Date</Text>
                  <Text style={styles.dateTimeValue}>{item.proposedDate}</Text>
                </View>
                <View style={styles.dateTimeBox}>
                  <Text style={styles.dateTimeLabel}>Time</Text>
                  <Text style={styles.dateTimeValue}>{item.proposedTime}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: c.bg }]}>
                  <Text style={[styles.statusText, { color: c.text }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Owner Actions */}
              {isOwner && item.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleAction(item.scheduleId, 'rejected', 'Decline')}
                  >
                    <Text style={styles.rejectBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleAction(item.scheduleId, 'accepted', 'Accept')}
                  >
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Student Cancel */}
              {!isOwner && item.status === 'pending' && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleAction(item.scheduleId, 'cancelled', 'Cancel')}
                >
                  <Text style={styles.cancelBtnText}>Cancel Request</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2D3748', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  listingTitle: { fontSize: 16, fontWeight: '700', color: '#2D3748', marginBottom: 4 },
  meta: { fontSize: 13, color: '#718096', marginBottom: 12 },
  dateTimeRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 14 },
  dateTimeBox: {
    flex: 1, backgroundColor: '#F7FAFC',
    borderRadius: 10, padding: 10,
  },
  dateTimeLabel: { fontSize: 11, color: '#A0AEC0', marginBottom: 2 },
  dateTimeValue: { fontSize: 13, fontWeight: '700', color: '#2D3748' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1, padding: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#FED7D7',
    alignItems: 'center', backgroundColor: '#FFF5F5',
  },
  rejectBtnText: { color: '#E53E3E', fontWeight: '700' },
  acceptBtn: {
    flex: 2, padding: 12, borderRadius: 10,
    backgroundColor: '#3B82F6', alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontWeight: '700' },
  cancelBtn: {
    padding: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#E53E3E', fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#A0AEC0', textAlign: 'center', paddingHorizontal: 20 },
});