import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { api } from '../services/api';

export default function BudgetScreen() {
  const [budget, setBudget] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [expenseCat, setExpenseCat] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmt, setExpenseAmt] = useState('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [tab, setTab] = useState<'overview' | 'add' | 'analysis'>('overview');

  const loadData = async () => {
    try {
      const [b, e, a] = await Promise.all([
        api.getBudget(),
        api.getExpenses(),
        api.getAnalysis(),
      ]);
      setBudget(b);
      setExpenses(e);
      setAnalysis(a);
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  const handleSetBudget = async () => {
    if (!amount) return;
    const now = new Date();
    await api.setBudget(now.getMonth() + 1, now.getFullYear(), parseFloat(amount));
    setAmount('');
    loadData();
  };

  const handleAddExpense = async () => {
    if (!expenseAmt || !expenseCat) return;
    await api.addExpense({
      amount: parseFloat(expenseAmt),
      category: expenseCat,
      description: expenseDesc || expenseCat,
    });
    setExpenseAmt('');
    setExpenseCat('');
    setExpenseDesc('');
    loadData();
  };

  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Rent', 'Health', 'Petrol', 'Other'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Budget</Text>

      <View style={styles.tabs}>
        {(['overview', 'add', 'analysis'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'overview' && (
        <>
          {budget?.budget ? (
            <View style={styles.budgetCard}>
              <Text style={styles.budgetLabel}>Monthly Budget</Text>
              <Text style={styles.budgetAmount}>${budget.budget.amount.toFixed(0)}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(100, (budget.spent / budget.budget.amount) * 100)}%` }]} />
              </View>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetStat}>Spent: ${budget.spent.toFixed(0)}</Text>
                <Text style={styles.budgetStat}>Left: ${budget.remaining.toFixed(0)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.setBudget}>
              <Text style={styles.sectionTitle}>Set Monthly Budget</Text>
              <TextInput style={styles.input} placeholder="Amount" placeholderTextColor={theme.textMuted} value={amount} onChangeText={setAmount} keyboardType="numeric" />
              <TouchableOpacity style={styles.button} onPress={handleSetBudget}><Text style={styles.buttonText}>Set Budget</Text></TouchableOpacity>
            </View>
          )}

          {budget?.tips?.map((tip: string, i: number) => (
            <View key={i} style={styles.tipCard}>
              <Ionicons name="bulb-outline" size={16} color={theme.warning} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          {expenses.slice(0, 10).map((e: any) => (
            <View key={e.id} style={styles.expenseRow}>
              <View>
                <Text style={styles.expenseCat}>{e.category}</Text>
                <Text style={styles.expenseDesc}>{e.description}</Text>
              </View>
              <Text style={styles.expenseAmt}>${e.amount.toFixed(2)}</Text>
            </View>
          ))}
        </>
      )}

      {tab === 'add' && (
        <>
          <Text style={styles.sectionTitle}>Add Permanent Expense</Text>
          <Text style={styles.hint}>e.g. Petrol, Rent, Subscriptions</Text>
          <TextInput style={styles.input} placeholder="Category" placeholderTextColor={theme.textMuted} value={expenseCat} onChangeText={setExpenseCat} />
          <TextInput style={styles.input} placeholder="Description" placeholderTextColor={theme.textMuted} value={expenseDesc} onChangeText={setExpenseDesc} />
          <TextInput style={styles.input} placeholder="Amount" placeholderTextColor={theme.textMuted} value={expenseAmt} onChangeText={setExpenseAmt} keyboardType="numeric" />
          <TouchableOpacity style={styles.button} onPress={handleAddExpense}><Text style={styles.buttonText}>Log Expense</Text></TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Quick Categories</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat} style={styles.categoryChip} onPress={() => setExpenseCat(cat)}>
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {tab === 'analysis' && analysis && (
        <>
          <Text style={styles.sectionTitle}>Spending Breakdown</Text>
          <Text style={styles.totalSpent}>Total: ${analysis.total.toFixed(2)}</Text>
          {analysis.insights?.map((insight: any, i: number) => (
            <View key={i} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightCat}>{insight.category}</Text>
                <Text style={styles.insightPct}>{insight.percentage}%</Text>
                <Text style={styles.insightAmt}>${insight.amount.toFixed(2)}</Text>
              </View>
              <Text style={styles.insightTip}>{insight.tip}</Text>
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
  budgetCard: { backgroundColor: theme.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: theme.border },
  budgetLabel: { fontSize: 14, color: theme.textSecondary },
  budgetAmount: { fontSize: 36, fontWeight: '700', color: theme.text, marginVertical: 8 },
  progressBar: { height: 6, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: theme.text, borderRadius: 3 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetStat: { fontSize: 13, color: theme.textSecondary },
  setBudget: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.text, marginBottom: 12, marginTop: 8 },
  input: { backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 16, color: theme.text, marginBottom: 12, borderWidth: 1, borderColor: theme.border },
  button: { backgroundColor: theme.text, borderRadius: 12, padding: 14, alignItems: 'center' },
  buttonText: { color: theme.background, fontSize: 16, fontWeight: '600' },
  tipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderRadius: 12, padding: 14, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: theme.border },
  tipText: { color: theme.textSecondary, fontSize: 13, flex: 1 },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  expenseCat: { fontSize: 15, fontWeight: '500', color: theme.text },
  expenseDesc: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  expenseAmt: { fontSize: 15, fontWeight: '600', color: theme.text },
  hint: { fontSize: 12, color: theme.textMuted, marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { backgroundColor: theme.surface, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.border },
  categoryText: { color: theme.text, fontSize: 13 },
  totalSpent: { fontSize: 16, color: theme.textSecondary, marginBottom: 12 },
  insightCard: { backgroundColor: theme.card, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  insightHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  insightCat: { fontSize: 15, fontWeight: '600', color: theme.text },
  insightPct: { fontSize: 14, color: theme.textSecondary },
  insightAmt: { fontSize: 14, fontWeight: '600', color: theme.text },
  insightTip: { fontSize: 13, color: theme.textSecondary, lineHeight: 18 },
});
