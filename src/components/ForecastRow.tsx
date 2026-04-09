import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DailyForecast } from '@/types';
import { formatDay } from '@/utils/formatDay';
import { CONDITION_EMOJI } from '@/utils/emojis';

interface ForecastRowProps {
  item: DailyForecast;
  index: number;
}

export function ForecastRow({ item, index }: ForecastRowProps) {
  const emoji = CONDITION_EMOJI[item.condition] ?? '-';
  return (
    <View style={styles.forecastRow} testID={`forecast-row-${index}`}>
      <Text style={styles.forecastDay} testID={`forecast-day-${index}`}>
        {formatDay(item.date, index)}
      </Text>
      <Text style={styles.forecastEmoji} testID={`forecast-emoji-${index}`}>
        {emoji}
      </Text>
      <Text
        style={styles.forecastDesc}
        numberOfLines={1}
        testID={`forecast-desc-${index}`}
      >
        {item.description}
      </Text>
      <Text style={styles.forecastTemp} testID={`forecast-temp-${index}`}>
        {item.tempMax}° / {item.tempMin}°
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  forecastDay: {
    width: 48,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  forecastEmoji: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  forecastDesc: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  forecastTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});
