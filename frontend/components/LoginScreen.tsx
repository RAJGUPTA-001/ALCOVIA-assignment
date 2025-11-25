import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { globalStyles, colors } from '../constants/styles';

interface LoginScreenProps {
  onLogin: (studentemail: string) => Promise<void>;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [studentemail, setStudentemail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    if (!studentemail.trim()) {
      setMessage('Please enter a student email');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await onLogin(studentemail.trim());
    } catch (error: any) {
      setMessage(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.primary }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={globalStyles.centerContainer}
      >
        <View style={globalStyles.card}>
          <Text style={globalStyles.title}>🎓 </Text>
          <Text style={globalStyles.subtitle}>Enter your Student email to begin</Text>
          
          <TextInput
            style={globalStyles.input}
            placeholder="student3@example.com"
            value={studentemail}
            onChangeText={setStudentemail}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
            onSubmitEditing={handleLogin}
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity
            style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={globalStyles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          {message ? (
            <Text style={globalStyles.message}>{message}</Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}