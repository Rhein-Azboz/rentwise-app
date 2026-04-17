// app/(tabs)/profile.tsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { logOut } from '../../src/services/auth.service';

export default function ProfileScreen() {
  const { user, setUser } = useAuthStore();

  const handleLogout = async () => {
    await logOut();
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
          </Text>
        </View>
      </View>

      {/* Info Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Full Name" value={user?.name || '—'} />
          <InfoRow label="Email" value={user?.email || '—'} />
          <InfoRow label="Role" value={user?.role || '—'} />
          <InfoRow
            label="Status"
            value={user?.isVerified ? 'Verified' : 'Pending Verification'}
            valueColor={user?.isVerified ? '#276749' : '#B7791F'}
          />
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

function InfoRow({
  label, value, valueColor,
}: {
  label: string; value: string; valueColor?: string;
}) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={[infoStyles.value, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7',
  },
  label: { fontSize: 14, color: '#718096' },
  value: { fontSize: 14, fontWeight: '600', color: '#2D3748', maxWidth: '60%', textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 40, backgroundColor: '#F5F7FA' },
  avatarBox: { alignItems: 'center', paddingTop: 64, paddingBottom: 28, backgroundColor: '#fff', marginBottom: 20 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#2D3748', marginBottom: 4 },
  email: { fontSize: 14, color: '#718096', marginBottom: 10 },
  roleBadge: { backgroundColor: '#EBF8FF', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  roleBadgeText: { color: '#3B82F6', fontWeight: '700', fontSize: 13 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#A0AEC0', marginBottom: 10, textTransform: 'uppercase' },
  infoCard: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, overflow: 'hidden' },
  logoutBtn: {
    marginHorizontal: 20, backgroundColor: '#FFF5F5',
    borderRadius: 12, padding: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FED7D7',
  },
  logoutText: { color: '#E53E3E', fontWeight: '700', fontSize: 15 },
});