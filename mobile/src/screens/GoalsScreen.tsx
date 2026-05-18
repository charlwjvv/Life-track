import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { api } from '../services/api';

export default function GoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const getWeekRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const loadGoals = async () => {
    try {
      const { start, end } = getWeekRange();
      const g = await api.getGoals(start, end);
      setGoals(g);
    } catch {}
  };

  useEffect(() => { loadGoals(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    const { start, end } = getWeekRange();
    await api.createGoal({ title: title.trim(), description: desc.trim() || undefined, weekStart: start, weekEnd: end });
    setTitle('');
    setDesc('');
    loadGoals();
  };

  const handleToggle = async (id: string) => {
    await api.toggleGoal(id);
    loadGoals();
  };

  const handleDelete = async (id: string) => {
    await api.deleteGoal(id);
    loadGoals();
  };

  const completed = goals.filter((g) => g.completed).length;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weekly Goals</Text>
      <Text style={styles.progress}>{completed}/{goals.length} completed</Text>

      <View style={styles.inputCard}>
        <TextInput style={styles.input} placeholder="What do you want to achieve?" placeholderTextColor={theme.textMuted} value={title} onChangeText={setTitle} />
        <TextInput style={[styles.input, styles.descInput]} placeholder="Details (optional)" placeholderTextColor={theme.textMuted} value={desc} onChangeText={setDesc} multiline />
        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Ionicons name="add" size={20} color={theme.background} />
          <Text style={styles.buttonText}>Add Goal</Text>
        </TouchableOpacity>
      </View>

      {goals.map((goal) => (
        <View key={goal.id} style={[styles.goalCard, goal.completed && styles.goalCompleted]}>
          <TouchableOpacity onPress={() => handleToggle(goal.id)} style={styles.checkbox}>
            <Ionicons name={goal.completed ? 'checkbox' : 'square-outline'} size={22} color={goal.completed ? theme.success : theme.textSecondary} />
          </TouchableOpacity>
          <View style={styles.goalContent}>
            <Text style={[styles.goalTitle, goal.completed && styles.goalTitleDone]}>{goal.title}</Text>
            {goal.description && <Text style={styles.goalDesc}>{goal.description}</Text>}
          </View>
          <TouchableOpacity onPress={() => handleDelete(goal.id)}>
            <Ionicons name="trash-outline" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 16 },
  title: { fontSize: 32, fontWeight: '700', color: theme.text, marginTop: 48, marginBottom: 4 },
  progress: { fontSize: 14, color: theme.textSecondary, marginBottom: 20 },
  inputCard: { backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.border },
  input: { backgroundColor: theme.surface, borderRadius: 10, padding: 14, fontSize: 15, color: theme.text, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  descInput: { height: 60, textAlignVertical: 'top' },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.text, borderRadius: 10, padding: 12, gap: 6 },
  buttonText: { color: theme.background, fontSize: 15, fontWeight: '600' },
  goalCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  goalCompleted: { opacity: 0.5 },
  checkbox: { marginRight: 12 },
  goalContent: { flex: 1 },
  goalTitle: { fontSize: 15, fontWeight: '500', color: theme.text },
  goalTitleDone: { textDecorationLine: 'line-through', color: theme.textMuted },
  goalDesc: { fontSize: 12, color: theme.textSecondary, marginTop: 4 },
});
