import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface CityInputProps {
  currentCity: string;
  onSubmit: (city: string) => void;
}

export function CityInput({ currentCity, onSubmit }: CityInputProps) {
  const [value, setValue] = useState(currentCity);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <View style={styles.container} testID="city-input-container">
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        onSubmitEditing={handleSubmit}
        placeholder="Enter city name"
        placeholderTextColor="rgba(255,255,255,0.5)"
        returnKeyType="search"
        testID="city-input"
        autoCapitalize="words"
        autoCorrect={false}
      />
      <Pressable style={styles.button} onPress={handleSubmit} testID="search-button">
        <Text style={styles.buttonText}>Search</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  button: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
