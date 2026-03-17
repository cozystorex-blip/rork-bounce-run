import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface BlobCharacterProps {
  size?: number;
  color?: string;
  hatColor?: string;
  hatBandColor?: string;
  showSmoothie?: boolean;
}

export default React.memo(function BlobCharacter({
  size = 50,
  color = '#E87830',
  hatColor = '#CC2222',
  hatBandColor = '#991818',
  showSmoothie = false,
}: BlobCharacterProps) {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const squishAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const sipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -6, duration: 700, useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    const squishLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(squishAnim, { toValue: 1.06, duration: 600, useNativeDriver: true }),
        Animated.timing(squishAnim, { toValue: 0.95, duration: 600, useNativeDriver: true }),
      ])
    );
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2800),
        Animated.timing(blinkAnim, { toValue: 0.1, duration: 80, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.delay(200),
        Animated.timing(blinkAnim, { toValue: 0.1, duration: 60, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      ])
    );
    bobLoop.start();
    squishLoop.start();
    blinkLoop.start();

    let sipLoop: Animated.CompositeAnimation | null = null;
    if (showSmoothie) {
      sipLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(sipAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(sipAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.delay(1800),
        ])
      );
      sipLoop.start();
    }

    return () => { bobLoop.stop(); squishLoop.stop(); blinkLoop.stop(); sipLoop?.stop(); };
  }, [bobAnim, squishAnim, blinkAnim, sipAnim, showSmoothie]);

  const s = size;
  const bodyW = s * 1.25;
  const bodyH = s * 1.0;
  const eyeW = s * 0.34;
  const eyeH = s * 0.38;
  const pupilSize = s * 0.22;
  const pupilHL = s * 0.09;
  const outline = Math.max(3, s * 0.065);
  const hatH = s * 0.34;
  const hatW = s * 0.84;
  const cheekSize = s * 0.14;
  const armW = s * 0.18;
  const armH = s * 0.14;

  const cupW = s * 0.32;
  const cupH = s * 0.48;
  const strawW = s * 0.05;
  const strawH = s * 0.38;

  const sipTranslate = sipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const darkerColor = adjustColor(color, -30);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: s + 24 + (showSmoothie ? cupW + 6 : 0),
          height: s + 22,
          transform: [{ translateY: bobAnim }, { scaleY: squishAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.armL,
          {
            width: armW,
            height: armH,
            borderRadius: armW / 2,
            borderWidth: outline * 0.8,
            bottom: bodyH * 0.25,
            left: (s + 24 - bodyW) / 2 - armW * 0.2,
            backgroundColor: darkerColor,
            transform: [{ rotate: '-18deg' }],
          },
        ]}
      >
        <View style={[styles.armHand, { width: armW * 0.5, height: armH * 0.65, borderRadius: armW * 0.25, right: -armW * 0.08, backgroundColor: darkerColor, borderWidth: outline * 0.6 }]} />
      </View>
      <View
        style={[
          styles.armR,
          {
            width: armW,
            height: armH,
            borderRadius: armW / 2,
            borderWidth: outline * 0.8,
            bottom: bodyH * 0.25,
            right: showSmoothie ? cupW * 0.3 : (s + 24 - bodyW) / 2 - armW * 0.2,
            backgroundColor: darkerColor,
            transform: [{ rotate: '18deg' }],
          },
        ]}
      >
        <View style={[styles.armHand, { width: armW * 0.5, height: armH * 0.65, borderRadius: armW * 0.25, left: -armW * 0.08, backgroundColor: darkerColor, borderWidth: outline * 0.6 }]} />
      </View>

      <View
        style={[
          styles.body,
          {
            width: bodyW,
            height: bodyH,
            borderRadius: bodyW / 2.2,
            borderWidth: outline,
            bottom: 0,
            left: (s + 24 - bodyW) / 2,
            backgroundColor: color,
          },
        ]}
      >
        <View style={[styles.bodyShine, { width: bodyW * 0.24, height: bodyH * 0.1, top: bodyH * 0.08, left: bodyW * 0.14, borderRadius: bodyH * 0.05 }]} />
        <View style={[styles.bodyShine2, { width: bodyW * 0.12, height: bodyH * 0.06, top: bodyH * 0.22, left: bodyW * 0.12, borderRadius: bodyH * 0.03 }]} />

        <Animated.View style={[styles.eyeOuter, { width: eyeW, height: eyeH, borderRadius: eyeW / 2, borderWidth: outline, top: bodyH * 0.2, left: bodyW * 0.12, transform: [{ rotate: '-5deg' }, { scaleY: blinkAnim }] }]}>
          <View style={[styles.pupil, { width: pupilSize, height: pupilSize, borderRadius: pupilSize / 2, marginTop: eyeH * 0.14, marginLeft: eyeW * 0.14 }]}>
            <View style={[styles.pupilHL, { width: pupilHL, height: pupilHL, borderRadius: pupilHL / 2, top: pupilSize * 0.06, left: pupilSize * 0.06 }]} />
            <View style={[styles.pupilHL2, { width: pupilHL * 0.5, height: pupilHL * 0.5, borderRadius: pupilHL * 0.25, bottom: pupilSize * 0.1, right: pupilSize * 0.08 }]} />
          </View>
        </Animated.View>
        <Animated.View style={[styles.eyeOuter, { width: eyeW, height: eyeH, borderRadius: eyeW / 2, borderWidth: outline, top: bodyH * 0.2, right: bodyW * 0.12, transform: [{ rotate: '5deg' }, { scaleY: blinkAnim }] }]}>
          <View style={[styles.pupil, { width: pupilSize, height: pupilSize, borderRadius: pupilSize / 2, marginTop: eyeH * 0.14, marginLeft: eyeW * 0.14 }]}>
            <View style={[styles.pupilHL, { width: pupilHL, height: pupilHL, borderRadius: pupilHL / 2, top: pupilSize * 0.06, left: pupilSize * 0.06 }]} />
            <View style={[styles.pupilHL2, { width: pupilHL * 0.5, height: pupilHL * 0.5, borderRadius: pupilHL * 0.25, bottom: pupilSize * 0.1, right: pupilSize * 0.08 }]} />
          </View>
        </Animated.View>

        <View style={[styles.brow, { top: bodyH * 0.14, left: bodyW * 0.08, width: eyeW * 1.0, height: outline * 2, borderRadius: outline, transform: [{ rotate: '14deg' }] }]} />
        <View style={[styles.brow, { top: bodyH * 0.14, right: bodyW * 0.08, width: eyeW * 1.0, height: outline * 2, borderRadius: outline, transform: [{ rotate: '-14deg' }] }]} />

        <View style={[styles.cheek, { width: cheekSize, height: cheekSize * 0.5, borderRadius: cheekSize / 2, bottom: bodyH * 0.22, left: bodyW * 0.06 }]} />
        <View style={[styles.cheek, { width: cheekSize, height: cheekSize * 0.5, borderRadius: cheekSize / 2, bottom: bodyH * 0.22, right: bodyW * 0.06 }]} />

        {showSmoothie ? (
          <View style={[styles.sippingMouth, { width: s * 0.16, height: s * 0.16, bottom: bodyH * 0.08, left: bodyW * 0.5 - (s * 0.08), borderRadius: s * 0.08, borderWidth: outline * 0.7 }]} />
        ) : (
          <View style={[styles.mouth, { width: s * 0.32, height: s * 0.14, bottom: bodyH * 0.08, left: bodyW * 0.5 - (s * 0.32) / 2 + s * 0.02, borderBottomLeftRadius: s * 0.05, borderBottomRightRadius: s * 0.16, borderTopLeftRadius: s * 0.02, borderTopRightRadius: s * 0.02, borderWidth: outline * 0.7, transform: [{ rotate: '-3deg' }] }]}>
            <View style={[styles.tooth, { width: s * 0.06, height: s * 0.05, top: -1, right: s * 0.06 }]} />
          </View>
        )}

        <View style={[styles.chain, { bottom: bodyH * 0.34, left: bodyW * 0.36, width: s * 0.26, height: s * 0.035, borderRadius: s * 0.018, borderWidth: outline * 0.4 }]} />
      </View>

      <View
        style={[
          styles.hat,
          {
            width: hatW,
            height: hatH,
            borderTopLeftRadius: hatW * 0.48,
            borderTopRightRadius: hatW * 0.48,
            borderWidth: outline,
            top: 0,
            left: (s + 24 - hatW) / 2,
            backgroundColor: hatColor,
          },
        ]}
      >
        <View style={[styles.hatBrim, { width: hatW * 1.25, height: hatH * 0.22, bottom: -hatH * 0.05, left: -hatW * 0.12, borderRadius: hatH * 0.11, backgroundColor: hatColor, borderWidth: outline * 0.8 }]} />
        <View style={[styles.hatBand, { width: hatW, height: hatH * 0.22, bottom: hatH * 0.12, left: -outline, backgroundColor: hatBandColor }]} />
        <View style={[styles.hatShine, { width: hatW * 0.32, height: hatH * 0.26, top: hatH * 0.1, left: hatW * 0.08, borderRadius: hatH * 0.13 }]} />
      </View>

      {showSmoothie && (
        <Animated.View
          style={[
            styles.smoothieWrap,
            {
              right: -cupW * 0.15,
              bottom: bodyH * 0.05,
              transform: [{ translateY: sipTranslate }],
            },
          ]}
        >
          <View style={[styles.smoothieCup, { width: cupW, height: cupH, borderRadius: cupW * 0.22, borderWidth: outline * 0.7 }]}>
            <View style={[styles.smoothieLiquid, { backgroundColor: '#FF6B8A', borderRadius: cupW * 0.18 }]} />
            <View style={[styles.smoothieLiquidTop, { backgroundColor: '#FFB6D9', height: cupH * 0.18, borderTopLeftRadius: cupW * 0.18, borderTopRightRadius: cupW * 0.18 }]} />
            <View style={[styles.smoothieShine, { width: cupW * 0.15, height: cupH * 0.35, borderRadius: cupW * 0.08, left: cupW * 0.14, top: cupH * 0.2 }]} />
          </View>
          <View style={[styles.smoothieLid, { width: cupW * 1.12, height: cupH * 0.14, borderRadius: cupW * 0.1, borderWidth: outline * 0.6, top: -cupH * 0.02, left: -cupW * 0.06 }]} />
          <View style={[styles.smoothieStraw, { width: strawW, height: strawH, left: cupW * 0.6, top: -strawH * 0.7, borderWidth: outline * 0.4, borderRadius: strawW * 0.3 }]} />
          <View style={[styles.smoothieStrawBend, { width: strawW * 2.5, height: strawW * 2.5, left: cupW * 0.35, top: -strawH * 0.7 - strawW * 0.4, borderWidth: outline * 0.4, borderRadius: strawW * 1.25 }]} />
        </Animated.View>
      )}
    </Animated.View>
  );
});

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  body: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    overflow: 'visible',
    alignItems: 'center',
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 1,
    elevation: 6,
  },
  bodyShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  bodyShine2: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  bodyBump: {
    position: 'absolute',
  },
  eyeOuter: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderColor: '#1A1A2E',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  pupil: {
    backgroundColor: '#1A1A2E',
  },
  pupilHL: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  pupilHL2: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  brow: {
    position: 'absolute',
    backgroundColor: '#1A1A2E',
    zIndex: 5,
  },
  cheek: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 150, 150, 0.4)',
  },
  mouth: {
    position: 'absolute',
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
    overflow: 'visible',
  },
  tooth: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  sippingMouth: {
    position: 'absolute',
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
  },
  chain: {
    position: 'absolute',
    backgroundColor: '#FFD84A',
    borderColor: '#CC9900',
    zIndex: 6,
  },
  armL: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    zIndex: -1,
    overflow: 'visible',
  },
  armR: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    zIndex: -1,
    overflow: 'visible',
  },
  armHand: {
    position: 'absolute',
    bottom: -2,
    borderColor: '#1A1A2E',
  },
  hat: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    borderBottomWidth: 0,
    overflow: 'visible',
    zIndex: 3,
  },
  hatBrim: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    zIndex: 4,
  },
  hatBand: {
    position: 'absolute',
  },
  hatShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  smoothieWrap: {
    position: 'absolute',
    zIndex: 5,
  },
  smoothieCup: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: '#1A1A2E',
    overflow: 'hidden',
  },
  smoothieLiquid: {
    position: 'absolute',
    left: 2,
    right: 2,
    bottom: 2,
    top: '15%',
  },
  smoothieLiquidTop: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 2,
  },
  smoothieShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  smoothieLid: {
    position: 'absolute',
    backgroundColor: '#FF87A8',
    borderColor: '#1A1A2E',
    zIndex: 6,
  },
  smoothieStraw: {
    position: 'absolute',
    backgroundColor: '#2DD4A8',
    borderColor: '#1A1A2E',
    zIndex: 7,
  },
  smoothieStrawBend: {
    position: 'absolute',
    backgroundColor: '#2DD4A8',
    borderColor: '#1A1A2E',
    zIndex: 7,
  },
});
