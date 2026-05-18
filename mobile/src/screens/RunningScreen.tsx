import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { api } from '../services/api';

export default function RunningScreen({ navigation }: any) {
  const [weekly, setWeekly] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [stravaStatus, setStravaStatus] = useState<any>(null);

  const loadData = async () => {
    try {
      const [w, r, s] = await Promise.all([
        api.getWeeklyRuns(),
        api.getRoutes(),
        api.getStravaStatus(),
      ]);
      setWeekly(w);
      setRoutes(r);
      setStravaStatus(s);
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  const formatPace = (speed?: number) => {
    if (!speed) return '--';
    const pace = 60 / (speed * 3.6);
    const min = Math.floor(pace);
    const sec = Math.round((pace - min) * 60);
    return `${min}:${sec.toString().padStart(2, '0')} /km`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Running</Text>
        {!stravaStatus?.connected && (
          <TouchableOpacity style={styles.connectBtn} onPress={() => navigation.navigate('StravaConnect')}>
            <Ionicons name="walk" size={16} color={theme.background} />
            <Text style={styles.connectText}>Connect Strava</Text>
          </TouchableOpacity>
        )}
      </View>

      {stravaStatus?.connected && (
        <TouchableOpacity style={styles.syncBtn} onPress={loadData}>
          <Ionicons name="sync" size={16} color={theme.text} />
          <Text style={styles.syncText}>Sync from Strava</Text>
        </TouchableOpacity>
      )}

      <View style={styles.weeklyCard}>
        <Text style={styles.weeklyLabel}>This Week</Text>
        <Text style={styles.weeklyKm}>{weekly?.totalDistanceKm || '0.00'} km</Text>
        <View style={styles.weeklyStats}>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>{weekly?.runCount || 0}</Text>
            <Text style={styles.weeklyStatLabel}>Runs</Text>
          </View>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>{weekly?.totalTimeMinutes || 0}</Text>
            <Text style={styles.weeklyStatLabel}>Minutes</Text>
          </View>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>{weekly?.runs?.[0] ? formatPace(weekly.runs[0].averageSpeed) : '--'}</Text>
            <Text style={styles.weeklyStatLabel}>Avg Pace</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Runs</Text>
      {weekly?.runs?.map((run: any) => (
        <View key={run.id} style={styles.runCard}>
          <View style={styles.runHeader}>
            <Text style={styles.runName}>{run.name || 'Run'}</Text>
            <Text style={styles.runDate}>{new Date(run.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
          </View>
          <View style={styles.runStats}>
            <View style={styles.runStat}>
              <Text style={styles.runStatValue}>{(run.distance / 1000).toFixed(2)}</Text>
              <Text style={styles.runStatLabel}>km</Text>
            </View>
            <View style={styles.runStat}>
              <Text style={styles.runStatValue}>{formatPace(run.averageSpeed)}</Text>
              <Text style={styles.runStatLabel}>pace</Text>
            </View>
            <View style={styles.runStat}>
              <Text style={styles.runStatValue}>{Math.round(run.movingTime / 60)}</Text>
              <Text style={styles.runStatLabel}>min</Text>
            </View>
            {run.averageHeartrate && (
              <View style={styles.runStat}>
                <Text style={styles.runStatValue}>{Math.round(run.averageHeartrate)}</Text>
                <Text style={styles.runStatLabel}>bpm</Text>
              </View>
            )}
          </View>
        </View>
      ))}

      {routes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Routes</Text>
          {routes.slice(0, 5).map((route: any) => (
            <View key={route.id} style={styles.routeCard}>
              <Ionicons name="map-outline" size={20} color={theme.text} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.name || 'Route'}</Text>
                <Text style={styles.routeDist}>{(route.distance / 1000).toFixed(2)} km</Text>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 48, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', color: theme.text },
  connectBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FC4C02', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, gap: 6 },
  connectText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  syncBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, alignSelf: 'flex-end' },
  syncText: { color: theme.textSecondary, fontSize: 13 },
  weeklyCard: { backgroundColor: theme.card, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.border },
  weeklyLabel: { fontSize: 14, color: theme.textSecondary },
  weeklyKm: { fontSize: 42, fontWeight: '700', color: theme.text, marginVertical: 8 },
  weeklyStats: { flexDirection: 'row', justifyContent: 'space-around' },
  weeklyStat: { alignItems: 'center' },
  weeklyStatValue: { fontSize: 18, fontWeight: '600', color: theme.text },
  weeklyStatLabel: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 12, marginTop: 8 },
  runCard: { backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  runHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  runName: { fontSize: 15, fontWeight: '500', color: theme.text },
  runDate: { fontSize: 12, color: theme.textMuted },
  runStats: { flexDirection: 'row', justifyContent: 'space-between' },
  runStat: { alignItems: 'center' },
  runStatValue: { fontSize: 16, fontWeight: '600', color: theme.text },
  runStatLabel: { fontSize: 11, color: theme.textMuted, marginTop: 2 },
  routeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: theme.border },
  routeInfo: { flex: 1 },
  routeName: { fontSize: 14, color: theme.text },
  routeDist: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
});
