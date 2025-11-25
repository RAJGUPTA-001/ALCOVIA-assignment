import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { globalStyles, colors } from '../constants/styles';

interface LockedScreenProps {
  message?: string;
}

export default function LockedScreen({ message }: LockedScreenProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for lock icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation for loader
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.primary }]}>
      <View style={globalStyles.centerContainer}>
        <View style={globalStyles.card}>
          <Animated.Text 
            style={[
              styles.lockIcon,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            🔒
          </Animated.Text>

          <Text style={globalStyles.title}>Analysis in Progress</Text>
          <Text style={globalStyles.subtitle}>Waiting for Mentor Review...</Text>

          <Text style={styles.infoText}>
            Your recent performance requires mentor attention.
            You'll be notified once your mentor assigns next steps.
          </Text>

          <Text style={styles.infoSecondary}>
            Auto-unlock in 12 hours if no response
          </Text>

          <Animated.View 
            style={[
              styles.loader,
              { transform: [{ rotate: spin }] }
            ]} 
          />

          {message ? (
            <Text style={globalStyles.message}>{message}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lockIcon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 20,
  },
  infoText: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginVertical: 20,
  },
  infoSecondary: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  loader: {
    marginTop: 30,
    width: 50,
    height: 50,
    borderWidth: 5,
    borderColor: colors.lightGray,
    borderTopColor: colors.primary,
    borderRadius: 25,
    alignSelf: 'center',
  },
});