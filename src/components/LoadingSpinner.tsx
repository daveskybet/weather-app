import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Loading weather...' }: LoadingSpinnerProps) {
  return (
    <View style={styles.container} testID="loading-spinner">
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  message: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
});
