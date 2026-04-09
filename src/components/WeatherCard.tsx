import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ForecastTabs } from '@/components/ForecastTabs';
import { WeatherData } from '@/types';
import { CONDITION_EMOJI } from '@/utils/emojis';
interface WeatherCardProps {
  data: WeatherData;
}

export function WeatherCard({ data }: WeatherCardProps) {
  const emoji = CONDITION_EMOJI[data.condition] ?? '-';

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      testID="weather-card"
    >
      <Text style={styles.city} testID="weather-city">
        {data.city}
      </Text>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.temperature} testID="weather-temperature">
        {data.temperature}°C
      </Text>
      <Text style={styles.description} testID="weather-description">
        {data.description}
      </Text>

      <View style={styles.detailsRow}>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Feels like</Text>
          <Text style={styles.detailValue} testID="weather-feels-like">
            {data.feelsLike}°C
          </Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Humidity</Text>
          <Text style={styles.detailValue} testID="weather-humidity">
            {data.humidity}%
          </Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Wind</Text>
          <Text style={styles.detailValue} testID="weather-wind">
            {data.windSpeed} km/h
          </Text>
        </View>
      </View>

      {data.forecast.length > 0 && (
        <View style={styles.forecastSection} testID="forecast-section">
          <Text style={styles.forecastTitle}>7-Day Forecast</Text>
          <ForecastTabs forecast={data.forecast} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  city: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 72,
    marginVertical: 12,
  },
  temperature: {
    fontSize: 56,
    fontWeight: '300',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 24,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 20,
  },
  detail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  forecastSection: {
    width: '100%',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 20,
  },
  forecastTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
});
