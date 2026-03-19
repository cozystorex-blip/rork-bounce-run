import React from 'react';
import { View, StyleSheet } from 'react-native';
import { verticalScale, scale } from '@/constants/layout';

const GROUND_H = verticalScale(120);

export default React.memo(function GroundWave() {
  return (
    <View style={[styles.container, { height: GROUND_H }]}>
      <View style={styles.waterBody} />
      <View style={styles.grassHighlight} />
      <View style={styles.grassBody} />
      <View style={styles.grassMid} />
      <View style={styles.grassDark} />
      <View style={styles.grassOutline} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  waterBody: {
    position: 'absolute',
    bottom: '57%',
    left: 0,
    right: 0,
    height: verticalScale(18),
    backgroundColor: '#7ABFD8',
    opacity: 0.45,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
  },
  grassHighlight: {
    position: 'absolute',
    bottom: '54%',
    left: 0,
    right: 0,
    height: verticalScale(8),
    backgroundColor: '#A0E870',
    opacity: 0.6,
    zIndex: 2,
  },
  grassBody: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '62%',
    backgroundColor: '#72C240',
    zIndex: 2,
  },
  grassMid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: '#62B030',
    zIndex: 3,
  },
  grassDark: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '22%',
    backgroundColor: '#4A9828',
    zIndex: 4,
  },
  grassOutline: {
    position: 'absolute',
    bottom: '56%',
    left: 0,
    right: 0,
    height: scale(3.5),
    backgroundColor: '#1A1A2E',
    zIndex: 5,
  },
});
