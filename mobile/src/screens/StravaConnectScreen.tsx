import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { theme } from '../theme';
import { api } from '../services/api';

export default function StravaConnectScreen({ navigation }: any) {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    api.getStravaStatus().then(setStatus).catch(() => {});
  }, []);

  const handleConnect = async () => {
    try {
      const { url } = await api.getStravaAuthUrl();
      const result = await WebBrowser.openAuthSessionAsync(url, 'lifetrack://strava-callback');

      if (result.type === 'success') {
        const urlParts = new URL(result.url);
        const code = urlParts.searchParams.get('code');
        if (code) {
          await api.connectStrava(code);
          const s = await api.getStravaStatus();
          setStatus(s);
          Alert.alert('Connected', 'Strava is now linked to your account');
        }
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to connect Strava. Make sure STRAVA_CLIENT_ID is configured in the backend.');
    }
  };

  const handleSync = async () => {
    try {
      const data = await api.getStravaActivities();
      Alert.alert('Synced', `Found ${data.runs} runs`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Strava</Text>

      <View style={styles.card}>
        <Ionicons name="walk" size={48} color="#FC4C02" />
        <Text style={styles.cardTitle}>
          {status?.connected ? 'Connected' : 'Connect your Strava'}
        </Text>
        <Text style={styles.cardDesc}>
          {status?.connected
            ? `Synced ${status.totalRuns} runs so far`
            : 'Sync your runs, routes, and weekly mileage automatically'}
        </Text>

        {status?.connected ? (
          <>
            <View style={styles.statsRow}>
              <Text style={styles.stat}>Athlete ID: {status.athleteId || '--'}</Text>
              <Text style={styles.stat}>Total Runs: {status.totalRuns}</Text>
            </View>
            <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
              <Ionicons name="sync" size={18} color="#fff" />
              <Text style={styles.syncText}>Sync Activities</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
            <Ionicons name="walk" size={18} color="#fff" />
            <Text style={styles.connectText}>Connect with Strava</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.note}>
        You need a Strava account and to set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in the backend .env
      </Text>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: 32 },
  card: { backgroundColor: theme.card, borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  cardTitle: { fontSize: 20, fontWeight: '600', color: theme.text, marginTop: 16, marginBottom: 8 },
  cardDesc: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  statsRow: { alignItems: 'center', marginBottom: 20, gap: 4 },
  stat: { fontSize: 13, color: theme.textMuted },
  connectButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FC4C02', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, gap: 8 },
  syncButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.text, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, gap: 8 },
  connectText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  syncText: { color: theme.background, fontSize: 16, fontWeight: '600' },
  note: { fontSize: 12, color: theme.textMuted, textAlign: 'center', marginTop: 20, lineHeight: 18 },
  backBtn: { marginTop: 24, alignItems: 'center' },
  backText: { color: theme.textSecondary, fontSize: 14 },
});
