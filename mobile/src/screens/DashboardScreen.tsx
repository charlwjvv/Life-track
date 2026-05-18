import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { api } from '../services/api';

export default function DashboardScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [budget, setBudget] = useState<any>(null);
  const [weeklyRun, setWeeklyRun] = useState<any>(null);
  const [calories, setCalories] = useState<any>(null);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, []);

  const loadData = async () => {
    try {
      const u = await AsyncStorage.getItem('user');
      if (u) setUser(JSON.parse(u));

      const [b, r, c] = await Promise.all([
        api.getBudget().catch(() => null),
        api.getWeeklyRuns().catch(() => null),
        api.getCalories().catch(() => null),
      ]);
      setBudget(b);
      setWeeklyRun(r);
      setCalories(c);
    } catch {}
  };

  const username = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{username}</Text>
        </View>
        <TouchableOpacity onPress={async () => { await AsyncStorage.clear(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); }}>
          <Ionicons name="log-out-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Budget')}>
          <Ionicons name="wallet-outline" size={24} color={theme.text} />
          <Text style={styles.cardTitle}>Budget</Text>
          <Text style={styles.cardValue}>
            {budget ? `$${budget.remaining?.toFixed(0) || '0'}` : '--'}
          </Text>
          <Text style={styles.cardLabel}>remaining</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Running')}>
          <Ionicons name="walk-outline" size={24} color={theme.text} />
          <Text style={styles.cardTitle}>Running</Text>
          <Text style={styles.cardValue}>
            {weeklyRun ? `${weeklyRun.totalDistanceKm}` : '--'}
          </Text>
          <Text style={styles.cardLabel}>km this week</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Calories')}>
          <Ionicons name="flame-outline" size={24} color={theme.text} />
          <Text style={styles.cardTitle}>Calories</Text>
          <Text style={styles.cardValue}>
            {calories ? `${calories.total}` : '--'}
          </Text>
          <Text style={styles.cardLabel}>today</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Goals')}>
          <Ionicons name="checkbox-outline" size={24} color={theme.text} />
          <Text style={styles.cardTitle}>Goals</Text>
          <Text style={styles.cardValue}>Weekly</Text>
          <Text style={styles.cardLabel}>tracker</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Coach')}>
          <Ionicons name="fitness-outline" size={24} color={theme.text} />
          <Text style={styles.cardTitle}>Coach</Text>
          <Text style={styles.cardValue}>AI</Text>
          <Text style={styles.cardLabel}>running tips</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('StravaConnect')}>
          <Ionicons name="sync-outline" size={24} color={theme.text} />
          <Text style={styles.cardTitle}>Strava</Text>
          <Text style={styles.cardValue}>Sync</Text>
          <Text style={styles.cardLabel}>connect</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
  greeting: { fontSize: 14, color: theme.textSecondary },
  name: { fontSize: 24, fontWeight: '700', color: theme.text, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  card: { width: '47%', backgroundColor: theme.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: theme.border },
  cardTitle: { fontSize: 14, color: theme.textSecondary, marginTop: 12 },
  cardValue: { fontSize: 28, fontWeight: '700', color: theme.text, marginTop: 4 },
  cardLabel: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
});
