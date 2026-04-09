import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { DailyForecast } from '@/types';
import { CONDITION_EMOJI } from '@/utils/emojis';

interface ForecastDetailProps {
  item: DailyForecast;
}

export function ForecastDetail({ item }: ForecastDetailProps) {
  if (item.hourly.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      testID="forecast-detail"
    >
      {item.hourly.map((hour, index) => (
        <View key={hour.time} style={styles.hourItem} testID={`hourly-item-${index}`}>
          <Text style={styles.hourTime} testID={`hourly-time-${index}`}>
            {hour.time}
          </Text>
          <Text style={styles.hourEmoji} testID={`hourly-emoji-${index}`}>
            {CONDITION_EMOJI[hour.condition] ?? '-'}
          </Text>
          <Text style={styles.hourTemp} testID={`hourly-temp-${index}`}>
            {hour.temperature}°
          </Text>
          <Text style={styles.hourPrecip} testID={`hourly-precip-${index}`}>
            {hour.precipitationProbability}%
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 15,
    gap: 12,
  },
  hourItem: {
    alignItems: 'center',
    width: 52,
  },
  hourTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  hourEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  hourTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  hourPrecip: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
});
