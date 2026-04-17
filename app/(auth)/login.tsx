// app/(auth)/login.tsx
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { logIn, getUserData } from '../../src/services/auth.service';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleLogin = async () => {
  if (!email || !password) {
    setError('Please fill in all fields.');
    return;
  }
  setLoading(true);
  setError('');
  try {
    const firebaseUser = await logIn(email, password);
    const data = await getUserData(firebaseUser.uid);

    if (!data) {
      setError('Account not found. Please sign up.');
      setLoading(false);
      return;
    }

    // Block banned users
    if (data.isBanned) {
      setError('Your account has been suspended. Contact support.');
      setLoading(false);
      return;
    }

    // Block unverified or pending owners
    if (data.role === 'owner' && data.verificationStatus !== 'approved') {
      setError('Your account is still pending admin approval.');
      setLoading(false);
      return;
    }

    // All checks passed
    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      role: data.role,
      name: data.name,
      isVerified: data.isVerified,
      isBanned: data.isBanned,
    });

    router.replace('/(tabs)');

  } catch (e: any) {
    setError('Invalid email or password.');
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>RentWise</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

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
        placeholder="Password"
        placeholderTextColor="#A0AEC0"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Sign In</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28, backgroundColor: '#F5F7FA' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2D3748', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#718096', marginBottom: 32 },
  error: { color: '#E53E3E', marginBottom: 12, fontSize: 13 },
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