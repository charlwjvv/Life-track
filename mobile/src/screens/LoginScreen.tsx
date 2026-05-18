import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import { api } from '../services/api';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('demo@lifetrack.app');
  const [password, setPassword] = useState('demo123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      navigation.replace('Main');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LifeTrack</Text>
      <Text style={styles.subtitle}>Track your life in black & white</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={theme.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={theme.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, justifyContent: 'center', padding: 24 },
  title: { fontSize: 42, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: 8, letterSpacing: -1 },
  subtitle: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 48 },
  input: { backgroundColor: theme.surface, borderRadius: 12, padding: 16, fontSize: 16, color: theme.text, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  button: { backgroundColor: theme.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16, marginTop: 8 },
  buttonText: { color: theme.background, fontSize: 16, fontWeight: '600' },
  link: { color: theme.textSecondary, textAlign: 'center', fontSize: 14 },
});
