import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  StyleSheet,
  Platform
} from 'react-native';
import { globalStyles, colors } from '../constants/styles';

interface StudentData {
  Id: number;
  name: string;
  student_id?: string;
  email: string;
  status: string;
  intervention_id?: string;
  remedial_task?: string;
}

interface DashboardScreenProps {
  studentData: StudentData | null;
  onSubmitCheckin: (quiz: number, focus: number, tabs: number, studentId: number) => Promise<void>;
  tabSwitches: number;
  onTabSwitch: () => void;
}

export default function DashboardScreen({ 
  studentData, 
  onSubmitCheckin, 
  tabSwitches,
  onTabSwitch 
}: DashboardScreenProps) {
  // 1️⃣ State initialized as empty strings
  const [quizScore, setQuizScore] = useState('');
  const [focusTime, setFocusTime] = useState('');
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Debug logging
  console.log('📊 Dashboard - Student Data:', studentData);

  if (!studentData) {
    return (
      <View style={globalStyles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 20, color: colors.text }}>Loading student data...</Text>
      </View>
    );
  }

  // Tab visibility detection
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleVisibilityChange = () => {
        if (document.hidden && isTimerRunning) {
          onTabSwitch();
          if (tabSwitches >= 4) handleTabSwitchPenalty();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [isTimerRunning, tabSwitches]);

  const handleTabSwitchPenalty = async () => {
    setIsTimerRunning(false);
    setMessage('❌ Session failed due to excessive tab switching');
    await handleSubmit(true);
  };

  // 2️⃣ Handle Submit Logic
  const handleSubmit = async (isPenalty = false) => {
    // Validation: Only check if NOT a penalty
    if (!isPenalty) {
      if (quizScore.trim() === '' || focusTime.trim() === '') {
        setMessage('Please enter both quiz score and focus time');
        return;
      }
    }

    // 3️⃣ Parsing: Convert string to number ONLY here
    const quizValue = isPenalty ? 0 : parseInt(quizScore);
    const focusValue = isPenalty ? 0 : parseInt(focusTime);

    // Validate quiz range
    if (!isPenalty && (quizValue < 0 || quizValue > 10)) {
      setMessage('Quiz score must be between 0 and 10');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      console.log('📤 Submitting check-in:', {
        quiz: quizValue,
        focus: focusValue,
        tabs: tabSwitches,
        studentId: studentData.Id
      });

      await onSubmitCheckin(
        quizValue,
        focusValue,
        tabSwitches,
        studentData.Id
      );
      
      // 4️⃣ Reset only on success
      setQuizScore('');
      setFocusTime('');
      setIsTimerRunning(false);
      setMessage('✅ Check-in submitted successfully!');
      
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      setMessage(error.message || 'Failed to submit check-in');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return colors.success;
      case 'needs_intervention':
      case 'locked': return colors.danger;
      case 'remedial': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🎓 Alcovia Focus Mode</Text>
          <View style={styles.studentInfo}>
            <Text style={styles.studentText}>{studentData.name}</Text>
            <Text style={[styles.studentText, { fontSize: 12 }]}>{studentData.email}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(studentData.status) }]}>
              <Text style={styles.statusText}>{studentData.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Focus Time Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏱️ Focus Time</Text>
          <Text style={styles.label}>Enter time in minutes</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="e.g., 65"
            keyboardType="numeric"
            value={focusTime}           // ✅ Controlled input
            onChangeText={setFocusTime} // ✅ Updates state only
            maxLength={3}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Quiz Score Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Daily Quiz</Text>
          <Text style={styles.label}>Score (0-10)</Text>
          <TextInput
            style={globalStyles.input}
            placeholder="e.g., 8"
            keyboardType="numeric"
            value={quizScore}           // ✅ Controlled input
            onChangeText={setQuizScore} // ✅ Updates state only
            maxLength={2}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
          onPress={() => handleSubmit(false)} // ✅ Triggers processing
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={globalStyles.buttonText}>Submit Daily Check-in</Text>
          )}
        </TouchableOpacity>

        {message ? (
          <Text style={[
            globalStyles.message, 
            message.includes('❌') ? { color: colors.danger } : { color: colors.success }
          ]}>
            {message}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20 },
  header: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: colors.border },
  headerTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: colors.text, marginBottom: 10 },
  studentInfo: { alignItems: 'center' },
  studentText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
  statusText: { color: colors.surface, fontWeight: '600', fontSize: 12 },
  card: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 10 },
  label: { fontWeight: '600', color: colors.textSecondary, marginBottom: 8, fontSize: 14 },
});
