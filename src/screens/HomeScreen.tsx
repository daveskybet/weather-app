import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CityInput } from '@/components/CityInput';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { WeatherCard } from '@/components/WeatherCard';
import { useWeather } from '@/hooks/useWeather';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, city, setCity, refresh } = useWeather();

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.appTitle}>Weather</Text>
        </View>

        <View style={styles.inputSection}>
          <CityInput currentCity={city} onSubmit={setCity} />
        </View>

        <View style={styles.content}>
          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} onRetry={refresh} />}
          {data && !isLoading && <WeatherCard data={data} />}
        </View>

        {data && !isLoading && (
          <Pressable
            style={styles.refreshButton}
            onPress={refresh}
            testID="refresh-button"
          >
            <Text style={styles.refreshText}>↻ Refresh</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e3a5f',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  inputSection: {
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  refreshButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  refreshText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
});
