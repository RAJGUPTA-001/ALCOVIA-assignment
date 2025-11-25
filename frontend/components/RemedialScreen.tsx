import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet 
} from 'react-native';
import { globalStyles, colors } from '../constants/styles';

interface RemedialScreenProps {
  studentName: string;
  remedialTask: string;
  onComplete: () => Promise<void>;
}

export default function RemedialScreen({ 
  studentName, 
  remedialTask, 
  onComplete 
}: RemedialScreenProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleComplete = async () => {
    setLoading(true);
    setMessage('');

    try {
      await onComplete();
      setMessage('Task completed successfully!');
    } catch (error: any) {
      setMessage(error.message || 'Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.primary }]}>
      <View style={globalStyles.centerContainer}>
        <View style={globalStyles.card}>
          <Text style={globalStyles.title}>📚 Remedial Task</Text>
          <Text style={globalStyles.subtitle}>Hello, {studentName}</Text>

          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>Your Mentor Has Assigned:</Text>
            <Text style={styles.taskText}>{remedialTask}</Text>
          </View>

          <TouchableOpacity
            style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
            onPress={handleComplete}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={globalStyles.buttonText}>Mark Complete</Text>
            )}
          </TouchableOpacity>

          {message ? (
            <Text style={globalStyles.message}>{message}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: colors.background,
    padding: 24,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginVertical: 20,
  },
  taskTitle: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 12,
  },
  taskText: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
  },
});