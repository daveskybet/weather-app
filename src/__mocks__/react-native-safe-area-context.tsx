import React from 'react';
import { View } from 'react-native';

const SafeAreaProvider = ({ children }: { children: React.ReactNode }) => (
  <View>{children}</View>
);

const SafeAreaView = ({ children, style }: { children: React.ReactNode; style?: object }) => (
  <View style={style}>{children}</View>
);

const useSafeAreaInsets = () => ({ top: 0, right: 0, bottom: 0, left: 0 });

const useSafeAreaFrame = () => ({ x: 0, y: 0, width: 375, height: 812 });

export { SafeAreaProvider, SafeAreaView, useSafeAreaInsets, useSafeAreaFrame };
