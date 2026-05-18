import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { api } from '../services/api';

export default function CaloriesScreen() {
  const [log, setLog] = useState<any>(null);
  const [mealName, setMealName] = useState('');
  const [mealCal, setMealCal] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [goal, setGoal] = useState('2000');
  const [tab, setTab] = useState<'today' | 'history'>('today');
  const [history, setHistory] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [c, h] = await Promise.all([api.getCalories(), api.getCalorieHistory()]);
      setLog(c);
      setHistory(h);
      if (c?.goal) setGoal(String(c.goal));
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  const handleAddMeal = async () => {
    if (!mealName || !mealCal) return;
    await api.addMeal({ name: mealName, calories: parseInt(mealCal), mealType });
    setMealName('');
    setMealCal('');
    loadData();
  };

  const handleSetGoal = async () => {
    await api.setCalorieGoal(parseInt(goal));
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Calories</Text>

      <View style={styles.tabs}>
        {(['today', 'history'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'today' ? 'Today' : 'History'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'today' && (
        <>
          <View style={styles.calorieCard}>
            <Text style={styles.calorieLabel}>Daily Goal</Text>
            <View style={styles.goalRow}>
              <TextInput style={styles.goalInput} value={goal} onChangeText={setGoal} keyboardType="numeric" />
              <TouchableOpacity onPress={handleSetGoal}><Text style={styles.goalSet}>Set</Text></TouchableOpacity>
            </View>
            <Text style={styles.calorieValue}>{log?.total || 0}</Text>
            <Text style={styles.calorieSub}>of {log?.goal || 2000} calories</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(100, ((log?.total || 0) / (log?.goal || 2000)) * 100)}%` }]} />
            </View>
            <Text style={styles.calorieRemaining}>{Math.max(0, (log?.goal || 2000) - (log?.total || 0))} remaining</Text>
          </View>

          <Text style={styles.sectionTitle}>Log Meal</Text>
          <View style={styles.mealTypeRow}>
            {mealTypes.map((mt) => (
              <TouchableOpacity key={mt} style={[styles.mealTypeChip, mealType === mt && styles.mealTypeActive]} onPress={() => setMealType(mt)}>
                <Text style={[styles.mealTypeText, mealType === mt && styles.mealTypeTextActive]}>{mt}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} placeholder="Meal name" placeholderTextColor={theme.textMuted} value={mealName} onChangeText={setMealName} />
          <TextInput style={styles.input} placeholder="Calories" placeholderTextColor={theme.textMuted} value={mealCal} onChangeText={setMealCal} keyboardType="numeric" />
          <TouchableOpacity style={styles.button} onPress={handleAddMeal}>
            <Ionicons name="add" size={20} color={theme.background} />
            <Text style={styles.buttonText}>Add Meal</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {log?.meals?.map((meal: any) => (
            <View key={meal.id} style={styles.mealRow}>
              <View>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealType}>{meal.mealType}</Text>
              </View>
              <Text style={styles.mealCal}>{meal.calories} cal</Text>
            </View>
          ))}
        </>
      )}

      {tab === 'history' && (
        <>
          <Text style={styles.sectionTitle}>Last 30 Days</Text>
          {history.map((day: any) => (
            <View key={day.id} style={styles.historyRow}>
              <Text style={styles.historyDate}>{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
              <Text style={styles.historyCal}>{day.total} / {day.goal} cal</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 16 },
  title: { fontSize: 32, fontWeight: '700', color: theme.text, marginTop: 48, marginBottom: 16 },
  tabs: { flexDirection: 'row', marginBottom: 20, gap: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: theme.surface },
  tabActive: { backgroundColor: theme.text },
  tabText: { color: theme.textSecondary, fontSize: 14 },
  tabTextActive: { color: theme.background, fontWeight: '600' },
  calorieCard: { backgroundColor: theme.card, borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: theme.border },
  calorieLabel: { fontSize: 14, color: theme.textSecondary },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  goalInput: { backgroundColor: theme.surface, borderRadius: 8, padding: 8, fontSize: 14, color: theme.text, width: 80, borderWidth: 1, borderColor: theme.border, textAlign: 'center' },
  goalSet: { color: theme.text, fontSize: 14, fontWeight: '600' },
  calorieValue: { fontSize: 48, fontWeight: '700', color: theme.text },
  calorieSub: { fontSize: 14, color: theme.textSecondary, marginBottom: 12 },
  progressBar: { height: 8, backgroundColor: theme.border, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: theme.text, borderRadius: 4 },
  calorieRemaining: { fontSize: 13, color: theme.textSecondary },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 12, marginTop: 8 },
  mealTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  mealTypeChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  mealTypeActive: { backgroundColor: theme.text, borderColor: theme.text },
  mealTypeText: { color: theme.textSecondary, fontSize: 13 },
  mealTypeTextActive: { color: theme.background, fontWeight: '600' },
  input: { backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 15, color: theme.text, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.text, borderRadius: 12, padding: 14, gap: 6 },
  buttonText: { color: theme.background, fontSize: 15, fontWeight: '600' },
  mealRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  mealName: { fontSize: 15, fontWeight: '500', color: theme.text },
  mealType: { fontSize: 12, color: theme.textMuted, marginTop: 2, textTransform: 'capitalize' },
  mealCal: { fontSize: 15, fontWeight: '600', color: theme.text },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border },
  historyDate: { fontSize: 14, color: theme.text },
  historyCal: { fontSize: 14, color: theme.textSecondary },
});
