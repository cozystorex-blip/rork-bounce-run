import React from 'react';
import { View, StyleSheet } from 'react-native';

interface TrickIconProps {
  size: number;
  color: string;
}

export const BoostIcon = React.memo(function BoostIcon({ size, color }: TrickIconProps) {
  const s = size;
  const bodyW = s * 0.4;
  const bodyH = s * 0.55;
  const noseH = s * 0.22;
  const finW = s * 0.18;
  const finH = s * 0.2;
  const flameW = s * 0.22;
  const flameH = s * 0.28;

  return (
    <View style={[iconStyles.wrap, { width: s, height: s }]}>
      <View style={{
        width: bodyW,
        height: bodyH,
        backgroundColor: color,
        borderRadius: bodyW * 0.3,
        borderWidth: 1.5,
        borderColor: '#1A1A2E',
        position: 'absolute',
        top: s * 0.15,
        left: (s - bodyW) / 2,
      }} />
      <View style={{
        width: 0,
        height: 0,
        borderLeftWidth: bodyW * 0.5,
        borderRightWidth: bodyW * 0.5,
        borderBottomWidth: noseH,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
        position: 'absolute',
        top: s * 0.15 - noseH + 2,
        left: (s - bodyW) / 2,
      }} />
      <View style={{
        position: 'absolute',
        top: s * 0.15 - noseH + 4,
        left: (s - bodyW) / 2,
        right: (s - bodyW) / 2,
        height: 1.5,
        backgroundColor: '#1A1A2E',
      }} />
      <View style={{
        width: finW,
        height: finH,
        backgroundColor: color + 'AA',
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#1A1A2E',
        position: 'absolute',
        bottom: s * 0.18,
        left: (s - bodyW) / 2 - finW * 0.5,
        transform: [{ rotate: '-20deg' }],
      }} />
      <View style={{
        width: finW,
        height: finH,
        backgroundColor: color + 'AA',
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#1A1A2E',
        position: 'absolute',
        bottom: s * 0.18,
        right: (s - bodyW) / 2 - finW * 0.5,
        transform: [{ rotate: '20deg' }],
      }} />
      <View style={{
        width: flameW,
        height: flameH,
        backgroundColor: '#FFD84A',
        borderRadius: flameW * 0.4,
        borderBottomLeftRadius: flameW * 0.15,
        borderBottomRightRadius: flameW * 0.15,
        position: 'absolute',
        bottom: s * 0.02,
        left: (s - flameW) / 2,
      }} />
      <View style={{
        width: flameW * 0.5,
        height: flameH * 0.6,
        backgroundColor: '#FF6B35',
        borderRadius: flameW * 0.2,
        position: 'absolute',
        bottom: s * 0.02,
        left: (s - flameW * 0.5) / 2,
      }} />
      <View style={{
        width: s * 0.08,
        height: s * 0.08,
        borderRadius: s * 0.04,
        backgroundColor: '#FFF',
        position: 'absolute',
        top: s * 0.28,
        left: (s - bodyW) / 2 + bodyW * 0.25,
      }} />
    </View>
  );
});

export const DiveIcon = React.memo(function DiveIcon({ size, color }: TrickIconProps) {
  const s = size;
  const boltW = s * 0.5;

  return (
    <View style={[iconStyles.wrap, { width: s, height: s }]}>
      <View style={{
        width: 0,
        height: 0,
        borderLeftWidth: boltW * 0.55,
        borderRightWidth: boltW * 0.15,
        borderBottomWidth: s * 0.35,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
        position: 'absolute',
        top: s * 0.08,
        left: s * 0.2,
      }} />
      <View style={{
        width: boltW * 0.7,
        height: s * 0.12,
        backgroundColor: color,
        position: 'absolute',
        top: s * 0.38,
        left: s * 0.18,
      }} />
      <View style={{
        width: 0,
        height: 0,
        borderLeftWidth: boltW * 0.15,
        borderRightWidth: boltW * 0.55,
        borderTopWidth: s * 0.35,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: color,
        position: 'absolute',
        top: s * 0.48,
        left: s * 0.25,
      }} />
      <View style={{
        width: boltW * 0.15,
        height: s * 0.2,
        backgroundColor: '#FFD84A',
        borderRadius: 2,
        position: 'absolute',
        top: s * 0.15,
        left: s * 0.35,
        opacity: 0.6,
      }} />
    </View>
  );
});

export const BarrelIcon = React.memo(function BarrelIcon({ size, color }: TrickIconProps) {
  const s = size;
  const ringSize = s * 0.6;
  const ringBorder = Math.max(2.5, s * 0.08);
  const arrowSize = s * 0.14;

  return (
    <View style={[iconStyles.wrap, { width: s, height: s }]}>
      <View style={{
        width: ringSize,
        height: ringSize,
        borderRadius: ringSize / 2,
        borderWidth: ringBorder,
        borderColor: color,
        borderRightColor: 'transparent',
        position: 'absolute',
        top: (s - ringSize) / 2,
        left: (s - ringSize) / 2,
      }} />
      <View style={{
        width: 0,
        height: 0,
        borderLeftWidth: arrowSize * 0.7,
        borderRightWidth: arrowSize * 0.7,
        borderBottomWidth: arrowSize,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
        position: 'absolute',
        top: (s - ringSize) / 2 - arrowSize * 0.3,
        right: (s - ringSize) / 2 + ringBorder * 0.2,
        transform: [{ rotate: '30deg' }],
      }} />
      <View style={{
        width: s * 0.12,
        height: s * 0.12,
        borderRadius: s * 0.06,
        backgroundColor: color,
        position: 'absolute',
        top: (s - s * 0.12) / 2,
        left: (s - s * 0.12) / 2,
      }} />
    </View>
  );
});

export const SpinIcon = React.memo(function SpinIcon({ size, color }: TrickIconProps) {
  const s = size;
  const starPoints = 4;
  const outerR = s * 0.35;
  const innerR = s * 0.14;

  return (
    <View style={[iconStyles.wrap, { width: s, height: s }]}>
      {Array.from({ length: starPoints }).map((_, i) => {
        const angle = (i / starPoints) * Math.PI * 2 - Math.PI / 4;
        const tipX = s / 2 + Math.cos(angle) * outerR - s * 0.04;
        const tipY = s / 2 + Math.sin(angle) * outerR - s * 0.04;
        return (
          <View
            key={i}
            style={{
              width: s * 0.08,
              height: outerR - innerR + s * 0.06,
              backgroundColor: color,
              borderRadius: s * 0.03,
              position: 'absolute',
              top: tipY,
              left: tipX,
              transform: [{ rotate: `${(angle * 180) / Math.PI + 90}deg` }],
            }}
          />
        );
      })}
      <View style={{
        width: innerR * 2,
        height: innerR * 2,
        borderRadius: innerR,
        backgroundColor: color,
        position: 'absolute',
        top: (s - innerR * 2) / 2,
        left: (s - innerR * 2) / 2,
        borderWidth: 1.5,
        borderColor: '#1A1A2E',
      }} />
      {Array.from({ length: starPoints }).map((_, i) => {
        const angle = (i / starPoints) * Math.PI * 2;
        const sparkX = s / 2 + Math.cos(angle) * outerR * 1.1 - 1.5;
        const sparkY = s / 2 + Math.sin(angle) * outerR * 1.1 - 1.5;
        return (
          <View
            key={`spark-${i}`}
            style={{
              width: 3,
              height: 3,
              borderRadius: 1.5,
              backgroundColor: '#FFD84A',
              position: 'absolute',
              top: sparkY,
              left: sparkX,
            }}
          />
        );
      })}
    </View>
  );
});

export const SuperFlapIcon = React.memo(function SuperFlapIcon({ size, color }: TrickIconProps) {
  const s = size;
  const bodyW = s * 0.4;
  const bodyH = s * 0.32;
  const wingW = s * 0.3;
  const wingH = s * 0.2;

  return (
    <View style={[iconStyles.wrap, { width: s, height: s }]}>
      <View style={{
        width: bodyW,
        height: bodyH,
        backgroundColor: color,
        borderRadius: bodyH / 2,
        borderWidth: 1.5,
        borderColor: '#1A1A2E',
        position: 'absolute',
        top: (s - bodyH) / 2,
        left: (s - bodyW) / 2,
      }} />
      <View style={{
        width: wingW,
        height: wingH,
        backgroundColor: color + 'BB',
        borderTopLeftRadius: wingW * 0.5,
        borderTopRightRadius: wingW * 0.3,
        borderBottomLeftRadius: wingW * 0.1,
        borderWidth: 1,
        borderColor: '#1A1A2E',
        position: 'absolute',
        top: (s - bodyH) / 2 - wingH * 0.7,
        left: (s - bodyW) / 2 - wingW * 0.1,
        transform: [{ rotate: '-15deg' }],
      }} />
      <View style={{
        width: wingW,
        height: wingH,
        backgroundColor: color + 'BB',
        borderTopLeftRadius: wingW * 0.3,
        borderTopRightRadius: wingW * 0.5,
        borderBottomRightRadius: wingW * 0.1,
        borderWidth: 1,
        borderColor: '#1A1A2E',
        position: 'absolute',
        top: (s - bodyH) / 2 - wingH * 0.7,
        right: (s - bodyW) / 2 - wingW * 0.1,
        transform: [{ rotate: '15deg' }],
      }} />
      <View style={{
        width: s * 0.07,
        height: s * 0.07,
        borderRadius: s * 0.035,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#1A1A2E',
        position: 'absolute',
        top: (s - bodyH) / 2 + bodyH * 0.2,
        left: (s - bodyW) / 2 + bodyW * 0.3,
      }} />
      <View style={{
        width: s * 0.07,
        height: s * 0.07,
        borderRadius: s * 0.035,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#1A1A2E',
        position: 'absolute',
        top: (s - bodyH) / 2 + bodyH * 0.2,
        right: (s - bodyW) / 2 + bodyW * 0.3,
      }} />
      <View style={{
        width: s * 0.06,
        height: s * 0.1,
        backgroundColor: '#FFD84A',
        borderRadius: 2,
        borderWidth: 0.8,
        borderColor: '#1A1A2E',
        position: 'absolute',
        top: (s + bodyH) / 2 - s * 0.04,
        left: s * 0.53,
        transform: [{ rotate: '10deg' }],
      }} />
      <View style={{
        width: s * 0.08,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        top: (s - bodyH) / 2 - wingH * 1.0,
        left: s * 0.25,
        transform: [{ rotate: '-30deg' }],
        opacity: 0.6,
      }} />
      <View style={{
        width: s * 0.08,
        height: 2,
        backgroundColor: color,
        position: 'absolute',
        top: (s - bodyH) / 2 - wingH * 1.0,
        right: s * 0.25,
        transform: [{ rotate: '30deg' }],
        opacity: 0.6,
      }} />
    </View>
  );
});

const iconStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
