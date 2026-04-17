// app/(auth)/owner-pending.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { logOut } from '../../src/services/auth.service';

export default function OwnerPending() {
  const handleLogout = async () => {
    await logOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>

      <View style={styles.iconBox}>
        <Text style={styles.icon}>⏳</Text>
      </View>

      <Text style={styles.title}>Verification Submitted</Text>
      <Text style={styles.subtitle}>
        Your ID has been uploaded successfully. Our admin team will review
        your account within 24–48 hours.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>What happens next?</Text>
        <Text style={styles.infoItem}>1. Admin reviews your valid ID</Text>
        <Text style={styles.infoItem}>2. You receive an approval notification</Text>
        <Text style={styles.infoItem}>3. You can log in and post listings</Text>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleLogout}>
        <Text style={styles.btnText}>Back to Login</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center',
    paddingHorizontal: 28, backgroundColor: '#F5F7FA',
  },
  iconBox: { alignItems: 'center', marginBottom: 24 },
  icon: { fontSize: 56 },
  title: {
    fontSize: 24, fontWeight: 'bold',
    color: '#2D3748', marginBottom: 12, textAlign: 'center',
  },
  subtitle: {
    fontSize: 15, color: '#718096',
    textAlign: 'center', lineHeight: 24, marginBottom: 32,
  },
  infoBox: {
    backgroundColor: '#EBF8FF', borderRadius: 12,
    padding: 20, marginBottom: 32,
    borderWidth: 1, borderColor: '#BEE3F8',
  },
  infoTitle: {
    fontSize: 14, fontWeight: '700',
    color: '#2B6CB0', marginBottom: 12,
  },
  infoItem: { fontSize: 14, color: '#2B6CB0', marginBottom: 8 },
  btn: {
    backgroundColor: '#3B82F6', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});