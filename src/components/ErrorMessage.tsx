import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View style={styles.container} testID="error-message">
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message} testID="error-text">
        {message}
      </Text>
      {onRetry && (
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          testID="retry-button"
        >
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 48,
  },
  message: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
