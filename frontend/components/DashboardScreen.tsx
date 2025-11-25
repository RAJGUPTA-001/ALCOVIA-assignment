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
  const [quizScore, setQuizScore] = useState('');
  const [focusTime, setFocusTime] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastVisibilityChange = useRef<number>(Date.now());
  const fullscreenCheckInterval = useRef<NodeJS.Timeout | null>(null);

  console.log('📊 Dashboard - Student Data:', studentData);

  // ✅ HELPER FUNCTIONS - MUST BE DEFINED BEFORE JSX
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
      case 'unlocked':
      case 'active':
        return colors.success;
      case 'needs_intervention':
      case 'locked':
        return colors.danger;
      case 'remedial':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const checkFullscreenStatus = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
    return isCurrentlyFullscreen;
  };

  const enterFullscreen = async (): Promise<boolean> => {
    try {
      const elem = document.documentElement;

      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        await (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      } else {
        console.error('❌ Fullscreen API not supported');
        return false;
      }

      console.log('✅ Entered fullscreen mode');
      return true;
    } catch (error) {
      console.error('❌ Failed to enter fullscreen:', error);
      return false;
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      console.log('✅ Exited fullscreen mode');
    } catch (error) {
      console.error('❌ Failed to exit fullscreen:', error);
    }
  };

  // Loading state check
  if (!studentData) {
    return (
      <View style={globalStyles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 20, color: colors.text }}>Loading student data...</Text>
      </View>
    );
  }

  // ✅ Tab visibility detection
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleVisibilityChange = () => {
        const now = Date.now();
        const timeSinceLastChange = now - lastVisibilityChange.current;

        if (timeSinceLastChange < 1000) return;

        lastVisibilityChange.current = now;

        if (document.hidden && isTimerRunning) {
          console.warn('⚠️ CHEATING DETECTED: Tab switched or browser minimized');
          onTabSwitch();

          if (tabSwitches >= 4) {
            handleTabSwitchPenalty();
          } else {
            setMessage(`⚠️ Warning: ${tabSwitches + 1}/5 violations detected!`);
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [isTimerRunning, tabSwitches]);

  // ✅ Timer interval
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  // ✅ Continuous fullscreen monitoring
  useEffect(() => {
    if (Platform.OS === 'web' && isTimerRunning) {
      fullscreenCheckInterval.current = setInterval(() => {
        const currentlyFullscreen = checkFullscreenStatus();

        if (!currentlyFullscreen) {
          console.error('❌ FULLSCREEN VIOLATION DETECTED!');
          onTabSwitch();

          if (tabSwitches >= 4) {
            handleFullscreenExitPenalty();
          } else {
            setMessage(`❌ FULLSCREEN REQUIRED! Violation ${tabSwitches + 1}/5`);
          }
        }
      }, 1000);

      return () => {
        if (fullscreenCheckInterval.current) {
          clearInterval(fullscreenCheckInterval.current);
        }
      };
    }
  }, [isTimerRunning, tabSwitches]);

  // ✅ Fullscreen change event listener
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = checkFullscreenStatus();
        setIsFullscreen(isCurrentlyFullscreen);

        console.log(`🖥️ Fullscreen status changed: ${isCurrentlyFullscreen}`);

        if (!isCurrentlyFullscreen && isTimerRunning) {
          console.warn('⚠️ CHEATING: Exited fullscreen during focus session!');
          onTabSwitch();

          if (tabSwitches >= 4) {
            handleFullscreenExitPenalty();
          } else {
            setMessage(`❌ FULLSCREEN REQUIRED! Violation ${tabSwitches + 1}/5`);
          }
        }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);

      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      };
    }
  }, [isTimerRunning, tabSwitches]);

  // ✅ EVENT HANDLERS
  const startFocusTimer = async () => {
    console.log('🚀 Attempting to start focus timer...');

    const fullscreenSuccess = await enterFullscreen();

    if (!fullscreenSuccess) {
      setMessage('❌ CANNOT START: Browser must support fullscreen mode');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    const isActuallyFullscreen = checkFullscreenStatus();

    if (!isActuallyFullscreen) {
      setMessage('❌ CANNOT START: You must accept fullscreen to begin');
      return;
    }

    setIsTimerRunning(true);
    setElapsedSeconds(0);
    setMessage('⏱️ Focus timer started in FULLSCREEN. DO NOT exit fullscreen!');
    console.log('✅ Timer started in fullscreen mode');
  };

  const stopFocusTimer = async () => {
    setIsTimerRunning(false);
    const minutes = Math.floor(elapsedSeconds / 60);
    setFocusTime(minutes.toString());
    setMessage(`✅ Timer stopped. Total focus time: ${minutes} minutes`);

    if (fullscreenCheckInterval.current) {
      clearInterval(fullscreenCheckInterval.current);
    }

    await exitFullscreen();
    console.log('✅ Timer stopped and exited fullscreen');
  };

  const handleTabSwitchPenalty = async () => {
    setIsTimerRunning(false);
    setMessage('❌ SESSION FAILED: Excessive violations (5+)');

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (fullscreenCheckInterval.current) clearInterval(fullscreenCheckInterval.current);

    await exitFullscreen();
    await handleSubmit(true);
  };

  const handleFullscreenExitPenalty = async () => {
    console.error('💀 PENALTY TRIGGERED: Exited fullscreen 5 times');
    setIsTimerRunning(false);
    setMessage('❌ SESSION FAILED: Exited fullscreen during focus session (5 violations)');

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (fullscreenCheckInterval.current) clearInterval(fullscreenCheckInterval.current);

    await exitFullscreen();
    await handleSubmit(true);
  };

  const handleSubmit = async (isPenalty = false) => {
    if (!isPenalty && (quizScore.trim() === '' || focusTime.trim() === '')) {
      setMessage('Please enter both quiz score and focus time');
      return;
    }

    const quizValue = isPenalty ? 0 : parseInt(quizScore);
    const focusValue = isPenalty ? 0 : parseInt(focusTime);

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
        studentId: studentData.Id,
        penalty: isPenalty
      });

      await onSubmitCheckin(quizValue, focusValue, tabSwitches, studentData.Id);

      setQuizScore('');
      setFocusTime('');
      setElapsedSeconds(0);
      setIsTimerRunning(false);

      setMessage(isPenalty ? '❌ Session failed and recorded as penalty' : '✅ Check-in submitted successfully!');
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      setMessage(error.message || 'Failed to submit check-in');
    } finally {
      setLoading(false);
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
            <Text style={[styles.studentText, { fontSize: 12, marginTop: 4 }]}>
              {studentData.email}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(studentData.status) }]}>
              <Text style={styles.statusText}>
                {studentData.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Fullscreen Status Banner */}
        {isTimerRunning && (
          <View style={[
            styles.fullscreenBanner,
            { backgroundColor: isFullscreen ? colors.success + '20' : colors.danger + '20' }
          ]}>
            <Text style={[
              styles.fullscreenBannerText,
              { color: isFullscreen ? colors.success : colors.danger }
            ]}>
              {isFullscreen ? '✅ FULLSCREEN ACTIVE' : '❌ FULLSCREEN REQUIRED'}
            </Text>
            {!isFullscreen && (
              <Text style={styles.fullscreenBannerSubtext}>
                Press F11 or allow fullscreen to continue
              </Text>
            )}
          </View>
        )}

        {/* Violation Counter */}
        {tabSwitches > 0 && (
          <View style={[
            styles.warningCard,
            { backgroundColor: tabSwitches >= 4 ? colors.danger + '20' : colors.warning + '20' }
          ]}>
            <Text style={[
              styles.warningText,
              { color: tabSwitches >= 4 ? colors.danger : colors.warning }
            ]}>
              ⚠️ VIOLATIONS: {tabSwitches}/5
            </Text>
            <Text style={styles.warningSubtext}>
              {tabSwitches >= 4
                ? '🚨 FINAL WARNING: Next violation = AUTO-FAIL!'
                : `Includes: tab switches, fullscreen exits, minimizing (${5 - tabSwitches} remaining)`
              }
            </Text>
          </View>
        )}

        {/* Focus Timer Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏱️ Fullscreen Focus Session</Text>

          {!isTimerRunning ? (
            <>
              <View style={styles.requirementsBox}>
                <Text style={styles.requirementsTitle}>📋 REQUIREMENTS:</Text>
                <Text style={styles.requirementItem}>✅ Browser will enter FULLSCREEN mode</Text>
                <Text style={styles.requirementItem}>❌ DO NOT press ESC or F11 to exit</Text>
                <Text style={styles.requirementItem}>❌ DO NOT switch tabs or minimize</Text>
                <Text style={styles.requirementItem}>❌ DO NOT Alt+Tab or use other apps</Text>
                <Text style={[styles.requirementItem, { color: colors.danger, fontWeight: '700', marginTop: 10 }]}>
                  ⚠️ 5 violations = AUTOMATIC FAILURE (0 points)
                </Text>
              </View>

              <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: colors.success, marginTop: 15 }]}
                onPress={startFocusTimer}
              >
                <Text style={globalStyles.buttonText}>🖥️ START FULLSCREEN TIMER</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.timerDisplay}>
                <Text style={styles.timerValue}>{formatTime(elapsedSeconds)}</Text>
                <Text style={styles.timerLabel}>{Math.floor(elapsedSeconds / 60)} minutes elapsed</Text>
              </View>

              <View style={styles.activeWarning}>
                <Text style={styles.activeWarningTitle}>🔒 FOCUS MODE LOCKED</Text>
                <Text style={styles.activeWarningText}>• Stay in fullscreen (F11 locked)</Text>
                <Text style={styles.activeWarningText}>• No tab switching allowed</Text>
                <Text style={styles.activeWarningText}>• Violations are automatically detected</Text>
              </View>

              <TouchableOpacity
                style={[globalStyles.button, { backgroundColor: colors.danger }]}
                onPress={stopFocusTimer}
              >
                <Text style={globalStyles.buttonText}>⏹️ STOP TIMER & EXIT FULLSCREEN</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Focus Time Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Focus Time</Text>
          <Text style={styles.label}>
            {isTimerRunning ? 'Timer is running...' : 'Enter minutes manually or use timer'}
          </Text>
          <TextInput
            style={globalStyles.input}
            placeholder="e.g., 65"
            keyboardType="numeric"
            value={focusTime}
            onChangeText={setFocusTime}
            maxLength={3}
            placeholderTextColor={colors.textSecondary}
            editable={!isTimerRunning}
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
            value={quizScore}
            onChangeText={setQuizScore}
            maxLength={2}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[globalStyles.button, (loading || isTimerRunning) && globalStyles.buttonDisabled]}
          onPress={() => handleSubmit(false)}
          disabled={loading || isTimerRunning}
        >
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={globalStyles.buttonText}>
              {isTimerRunning ? '⏱️ Stop timer first' : 'Submit Daily Check-in'}
            </Text>
          )}
        </TouchableOpacity>

        {message && (
          <Text style={[
            globalStyles.message,
            message.includes('❌') && { color: colors.danger },
            message.includes('✅') && { color: colors.success },
            message.includes('⚠️') && { color: colors.warning }
          ]}>
            {message}
          </Text>
        )}
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
  fullscreenBanner: { padding: 15, borderRadius: 8, marginBottom: 15, alignItems: 'center', borderWidth: 2, borderColor: colors.danger },
  fullscreenBannerText: { fontWeight: '700', fontSize: 16 },
  fullscreenBannerSubtext: { fontSize: 12, color: colors.textSecondary, marginTop: 5 },
  warningCard: { padding: 15, borderRadius: 8, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: colors.warning },
  warningText: { fontWeight: '700', fontSize: 16, marginBottom: 5 },
  warningSubtext: { color: colors.textSecondary, fontSize: 13 },
  card: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 10 },
  label: { fontWeight: '600', color: colors.textSecondary, marginBottom: 8, fontSize: 14 },
  requirementsBox: { backgroundColor: colors.warning + '10', padding: 15, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: colors.warning },
  requirementsTitle: { fontWeight: '700', fontSize: 14, color: colors.text, marginBottom: 10 },
  requirementItem: { fontSize: 13, color: colors.textSecondary, marginTop: 5 },
  timerDisplay: { alignItems: 'center', marginVertical: 20 },
  timerValue: { fontSize: 48, fontWeight: 'bold', color: colors.primary, fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier' },
  timerLabel: { fontSize: 14, color: colors.textSecondary, marginTop: 5 },
  activeWarning: { backgroundColor: colors.danger + '15', padding: 15, borderRadius: 8, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: colors.danger },
  activeWarningTitle: { color: colors.danger, fontWeight: '700', fontSize: 14, marginBottom: 8 },
  activeWarningText: { color: colors.textSecondary, fontSize: 12, marginTop: 3 },
});
