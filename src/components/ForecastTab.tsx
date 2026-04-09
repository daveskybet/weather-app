import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { DailyForecast } from '@/types';
import { formatDay } from '@/utils/formatDay';
import { CONDITION_EMOJI } from '@/utils/emojis';

interface ForecastTabProps {
  item: DailyForecast;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}

export function ForecastTab({ item, index, isSelected, onPress }: ForecastTabProps) {
  return (
    <TouchableOpacity
      style={[styles.tab, isSelected && styles.tabSelected]}
      onPress={onPress}
      testID={`forecast-tab-${index}`}
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        style={[styles.tabDay, isSelected && styles.tabDaySelected]}
        testID={`forecast-tab-day-${index}`}
      >
        {formatDay(item.date, index)}
      </Text>
      <Text style={styles.tabEmoji} testID={`forecast-tab-emoji-${index}`}>
        {CONDITION_EMOJI[item.condition] ?? '-'}
      </Text>
      <Text style={styles.tabTemp} testID={`forecast-tab-temp-${index}`}>
        {item.tempMax}° / {item.tempMin}°
      </Text>
      <Text
        style={styles.tabDesc}
        numberOfLines={2}
        testID={`forecast-tab-desc-${index}`}
      >
        {item.description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 100,
  },
  tabSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabDay: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  tabDaySelected: {
    color: '#fff',
  },
  tabEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  tabTemp: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  tabDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});
