import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ForecastDetail } from '@/components/ForecastDetail';
import { ForecastTab } from '@/components/ForecastTab';
import { DailyForecast } from '@/types';

interface ForecastTabsProps {
  forecast: DailyForecast[];
}

export function ForecastTabs({ forecast }: ForecastTabsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = forecast[selectedIndex];

  if (!selected) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
        testID="forecast-tab-bar"
      >
        {forecast.map((item, index) => (
          <ForecastTab
            key={item.date}
            item={item}
            index={index}
            isSelected={index === selectedIndex}
            onPress={() => setSelectedIndex(index)}
          />
        ))}
      </ScrollView>

      <ForecastDetail item={selected} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -15,
  },
  tabBar: {
    flexDirection: 'row',
    paddingBottom: 12,
    gap: 8,
    paddingHorizontal: 15,
  },
});
