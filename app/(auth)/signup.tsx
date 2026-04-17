// app/(auth)/signup.tsx
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { signUp } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/stores/authStore';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'owner'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const firebaseUser = await signUp(email, password, role, name);
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        role,
        name,
        isVerified: role === 'student',
        isBanned: false,
      });
      if (role === 'student') {
        router.replace('/(auth)/student-setup');
      } else {
        router.replace('/(auth)/owner-setup');
      }
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        setError('This email is already registered.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join RentWise today</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Role Selector */}
        <Text style={styles.label}>I am a...</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]}
            onPress={() => setRole('student')}
          >
            <Text style={[styles.roleBtnText, role === 'student' && styles.roleBtnTextActive]}>
              Student
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'owner' && styles.roleBtnActive]}
            onPress={() => setRole('owner')}
          >
            <Text style={[styles.roleBtnText, role === 'owner' && styles.roleBtnTextActive]}>
              Property Owner
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#A0AEC0"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#A0AEC0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min. 6 characters)"
          placeholderTextColor="#A0AEC0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Create Account</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 40, backgroundColor: '#F5F7FA' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2D3748', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#718096', marginBottom: 28 },
  error: { color: '#E53E3E', marginBottom: 12, fontSize: 13 },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: {
    flex: 1, padding: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#CBD5E0',
    alignItems: 'center', backgroundColor: '#fff',
  },
  roleBtnActive: { borderColor: '#3B82F6', backgroundColor: '#EBF8FF' },
  roleBtnText: { color: '#718096', fontWeight: '600' },
  roleBtnTextActive: { color: '#3B82F6' },
  input: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: '#CBD5E0', padding: 14, fontSize: 15,
    color: '#2D3748', marginBottom: 14,
  },
  btn: {
    backgroundColor: '#3B82F6', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 4, marginBottom: 20,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: '#3B82F6', textAlign: 'center', fontSize: 14 },
});