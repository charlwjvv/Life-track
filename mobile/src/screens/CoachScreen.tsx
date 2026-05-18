import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { api } from '../services/api';

export default function CoachScreen() {
  const [advice, setAdvice] = useState<any[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'plan' | 'advice'>('plan');

  const loadData = async () => {
    try {
      const [p, a] = await Promise.all([
        api.getWeeklyPlan().catch(() => null),
        api.getAdvice().catch(() => []),
      ]);
      setPlan(p);
      setAdvice(a);
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await api.generateAdvice();
      await loadData();
    } catch {}
    setLoading(false);
  };

  const getDayColor = (type: string, completed: boolean) => {
    if (completed) return theme.success;
    if (type === 'Rest') return theme.textMuted;
    if (type.includes('Run') || type.includes('Easy') || type.includes('Long') || type.includes('Intervals')) return theme.text;
    return theme.textSecondary;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Running Coach</Text>
        <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} disabled={loading}>
          <Text style={styles.generateText}>{loading ? 'Analyzing...' : 'Analyze Week'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(['plan', 'advice'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'plan' ? 'Weekly Plan' : 'Advice'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'plan' && plan && (
        <>
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>Weekly Goal: {plan.weeklyGoal}km</Text>
            <Text style={styles.progressKm}>{plan.progressKm} / {plan.weeklyGoal} km</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${plan.progress}%` }]} />
            </View>
            <Text style={styles.progressPct}>{Math.round(plan.progress)}% complete</Text>
          </View>

          {plan.plan?.map((day: any, i: number) => (
            <View key={i} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{day.day}</Text>
                <Text style={styles.dayDate}>{day.date}</Text>
              </View>
              <View style={styles.dayInfo}>
                <Ionicons name={day.completed ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={getDayColor(day.type, day.completed)} />
                <Text style={[styles.dayType, { color: getDayColor(day.type, day.completed) }]}>{day.type}</Text>
                {day.distance && <Text style={styles.dayDist}>{day.distance} km</Text>}
              </View>
            </View>
          ))}
        </>
      )}

      {tab === 'advice' && (
        <>
          {advice.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="bulb-outline" size={32} color={theme.textMuted} />
              <Text style={styles.emptyText}>Tap "Analyze Week" to get personalized coaching advice</Text>
            </View>
          ) : (
            advice.map((a: any) => (
              <View key={a.id} style={styles.adviceCard}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color={theme.text} style={{ marginRight: 10 }} />
                <Text style={styles.adviceText}>{a.content}</Text>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 48, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', color: theme.text },
  generateBtn: { backgroundColor: theme.text, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  generateText: { color: theme.background, fontSize: 13, fontWeight: '600' },
  tabs: { flexDirection: 'row', marginBottom: 20, gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: theme.surface },
  tabActive: { backgroundColor: theme.text },
  tabText: { color: theme.textSecondary, fontSize: 14 },
  tabTextActive: { color: theme.background, fontWeight: '600' },
  progressCard: { backgroundColor: theme.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  progressLabel: { fontSize: 14, color: theme.textSecondary },
  progressKm: { fontSize: 28, fontWeight: '700', color: theme.text, marginVertical: 8 },
  progressBar: { height: 6, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: theme.text, borderRadius: 3 },
  progressPct: { fontSize: 13, color: theme.textSecondary },
  dayCard: { backgroundColor: theme.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: theme.border },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  dayName: { fontSize: 15, fontWeight: '600', color: theme.text },
  dayDate: { fontSize: 12, color: theme.textMuted },
  dayInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dayType: { fontSize: 14, fontWeight: '500' },
  dayDist: { fontSize: 13, color: theme.textSecondary },
  emptyCard: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { color: theme.textMuted, fontSize: 14, textAlign: 'center' },
  adviceCard: { flexDirection: 'row', backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: theme.border },
  adviceText: { color: theme.textSecondary, fontSize: 13, flex: 1, lineHeight: 18 },
});
