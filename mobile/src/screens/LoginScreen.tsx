import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { api } from '../services/api';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('demo@lifetrack.app');
  const [password, setPassword] = useState('demo123456');
  const [loading, setLoading] = useState(false);
  const [urlModalVisible, setUrlModalVisible] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleConfigureUrl = async () => {
    const current = await api.getBaseUrl();
    setUrlInput(current);
    setUrlModalVisible(true);
  };

  const handleSaveUrl = async () => {
    if (urlInput.trim()) {
      let finalUrl = urlInput.trim();
      if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;
      if (!finalUrl.endsWith('/api')) finalUrl = finalUrl.replace(/\/$/, '') + '/api';
      await api.setBaseUrl(finalUrl);
      setUrlModalVisible(false);
      Alert.alert('Saved', `Server URL set to:\n${finalUrl}`);
    }
  };

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
      <TouchableOpacity style={styles.settingsButton} onPress={handleConfigureUrl} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
        <Ionicons name="settings-outline" size={28} color={theme.text} />
      </TouchableOpacity>
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

      <TouchableOpacity style={styles.demoButton} onPress={async () => {
        setLoading(true);
        try {
          const data = await api.login('demo@lifetrack.app', 'demo123456');
          await AsyncStorage.setItem('token', data.token);
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
          navigation.replace('Main');
        } catch (err: any) {
          Alert.alert('Error', err.message);
        } finally {
          setLoading(false);
        }
      }}>
        <Text style={styles.demoButtonText}>Use Demo Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Create an account</Text>
      </TouchableOpacity>

      <Modal visible={urlModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Server URL</Text>
            <Text style={styles.modalSubtitle}>Enter the URL shown in WSL2 terminal after running the tunnel command</Text>
            <TextInput
              style={styles.urlInput}
              placeholder="https://your-tunnel.loca.lt/api"
              placeholderTextColor={theme.textMuted}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setUrlModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleSaveUrl}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, justifyContent: 'center', padding: 24 },
  settingsButton: { position: 'absolute', top: 60, right: 24, width: 48, height: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 24, borderWidth: 1, borderColor: theme.border, zIndex: 10 },
  title: { fontSize: 42, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: 8, letterSpacing: -1, marginTop: 40 },
  subtitle: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 48 },
  input: { backgroundColor: theme.surface, borderRadius: 12, padding: 16, fontSize: 16, color: theme.text, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  button: { backgroundColor: theme.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16, marginTop: 8 },
  buttonText: { color: theme.background, fontSize: 16, fontWeight: '600' },
  demoButton: { backgroundColor: theme.surface, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  demoButtonText: { color: theme.textSecondary, fontSize: 14, fontWeight: '500' },
  link: { color: theme.textSecondary, textAlign: 'center', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: theme.surface, borderRadius: 16, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 13, color: theme.textSecondary, marginBottom: 20, textAlign: 'center', lineHeight: 18 },
  urlInput: { backgroundColor: theme.background, borderRadius: 10, padding: 14, fontSize: 14, color: theme.text, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  modalCancelText: { color: theme.textSecondary, fontSize: 15, fontWeight: '500' },
  modalSave: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', backgroundColor: theme.primary },
  modalSaveText: { color: theme.background, fontSize: 15, fontWeight: '600' },
});
