import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface BlobCharacterProps {
  size?: number;
  color?: string;
  hatColor?: string;
  hatBandColor?: string;
  showSmoothie?: boolean;
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
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
  const earWiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -5, duration: 800, useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    const squishLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(squishAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(squishAnim, { toValue: 0.96, duration: 700, useNativeDriver: true }),
      ])
    );
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2800),
        Animated.timing(blinkAnim, { toValue: 0.08, duration: 80, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.delay(200),
        Animated.timing(blinkAnim, { toValue: 0.08, duration: 60, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      ])
    );
    const earLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(3200),
        Animated.timing(earWiggle, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(earWiggle, { toValue: -0.5, duration: 100, useNativeDriver: true }),
        Animated.timing(earWiggle, { toValue: 0, duration: 100, useNativeDriver: true }),
      ])
    );
    bobLoop.start();
    squishLoop.start();
    blinkLoop.start();
    earLoop.start();

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

    return () => { bobLoop.stop(); squishLoop.stop(); blinkLoop.stop(); earLoop.stop(); sipLoop?.stop(); };
  }, [bobAnim, squishAnim, blinkAnim, sipAnim, earWiggle, showSmoothie]);

  const s = size;
  const bodyW = s * 1.3;
  const bodyH = s * 1.08;
  const eyeW = s * 0.3;
  const eyeH = s * 0.34;
  const pupilSize = s * 0.2;
  const pupilHL = s * 0.08;
  const outline = Math.max(2.5, s * 0.055);
  const cheekSize = s * 0.15;
  const armW = s * 0.16;
  const armH = s * 0.13;
  const bellyColor = adjustColor(color, 50);
  const darkerColor = adjustColor(color, -30);
  const earInnerColor = adjustColor(color, 55);

  const cupW = s * 0.32;
  const cupH = s * 0.48;
  const strawW = s * 0.05;
  const strawH = s * 0.38;

  const sipTranslate = sipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const earWiggleRotL = earWiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['8deg', '0deg', '-12deg'],
  });
  const earWiggleRotR = earWiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '12deg'],
  });

  const earW = s * 0.28;
  const earH = s * 0.3;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: s * 1.4 + 24 + (showSmoothie ? cupW + 6 : 0),
          height: s * 1.3 + 22,
          transform: [{ translateY: bobAnim }, { scaleY: squishAnim }],
        },
      ]}
    >
      {/* Blobby ears on top */}
      <Animated.View style={[styles.ear, {
        width: earW, height: earH,
        top: earH * 0.12, left: (s * 1.4 + 24 - bodyW) / 2 + bodyW * 0.1,
        backgroundColor: color,
        borderRadius: earW * 0.45,
        borderTopLeftRadius: earW * 0.35, borderTopRightRadius: earW * 0.55,
        borderWidth: outline, borderColor: '#1A1A2E',
        transform: [{ rotate: earWiggleRotL as any }, { rotate: '-22deg' }],
      }]}>
        <View style={{ position: 'absolute', width: earW * 0.5, height: earH * 0.5, top: earH * 0.2, left: earW * 0.25, backgroundColor: earInnerColor, borderRadius: earW * 0.25 }} />
      </Animated.View>
      <Animated.View style={[styles.ear, {
        width: earW, height: earH,
        top: earH * 0.12, right: (s * 1.4 + 24 - bodyW) / 2 + bodyW * 0.1 + (showSmoothie ? cupW + 6 : 0),
        backgroundColor: color,
        borderRadius: earW * 0.45,
        borderTopLeftRadius: earW * 0.55, borderTopRightRadius: earW * 0.35,
        borderWidth: outline, borderColor: '#1A1A2E',
        transform: [{ rotate: earWiggleRotR as any }, { rotate: '22deg' }],
      }]}>
        <View style={{ position: 'absolute', width: earW * 0.5, height: earH * 0.5, top: earH * 0.2, right: earW * 0.25, backgroundColor: earInnerColor, borderRadius: earW * 0.25 }} />
      </Animated.View>

      {/* Arms */}
      <View
        style={[
          styles.armL,
          {
            width: armW, height: armH, borderRadius: armW / 2,
            borderWidth: outline * 0.75, bottom: bodyH * 0.22,
            left: (s * 1.4 + 24 - bodyW) / 2 - armW * 0.15,
            backgroundColor: darkerColor, transform: [{ rotate: '-15deg' }],
          },
        ]}
      >
        <View style={[styles.armHand, { width: armW * 0.48, height: armH * 0.6, borderRadius: armW * 0.24, right: -armW * 0.06, backgroundColor: darkerColor, borderWidth: outline * 0.55 }]} />
      </View>
      <View
        style={[
          styles.armR,
          {
            width: armW, height: armH, borderRadius: armW / 2,
            borderWidth: outline * 0.75, bottom: bodyH * 0.22,
            right: showSmoothie ? cupW * 0.3 : (s * 1.4 + 24 - bodyW) / 2 - armW * 0.15 + (showSmoothie ? cupW + 6 : 0),
            backgroundColor: darkerColor, transform: [{ rotate: '15deg' }],
          },
        ]}
      >
        <View style={[styles.armHand, { width: armW * 0.48, height: armH * 0.6, borderRadius: armW * 0.24, left: -armW * 0.06, backgroundColor: darkerColor, borderWidth: outline * 0.55 }]} />
      </View>

      {/* Fluffy tail */}
      <View style={[styles.tail, {
        width: s * 0.22, height: s * 0.16,
        borderRadius: s * 0.08,
        backgroundColor: adjustColor(color, 15),
        borderWidth: outline * 0.7, borderColor: '#1A1A2E',
        right: (s * 1.4 + 24 - bodyW) / 2 - s * 0.08 + (showSmoothie ? cupW + 6 : 0),
        bottom: bodyH * 0.12, transform: [{ rotate: '15deg' }],
      }]}>
        <View style={{ position: 'absolute', width: s * 0.1, height: s * 0.07, borderRadius: s * 0.05, backgroundColor: adjustColor(color, 45), top: s * 0.03, left: s * 0.02 }} />
      </View>

      {/* Body */}
      <View
        style={[
          styles.body,
          {
            width: bodyW, height: bodyH,
            borderRadius: bodyW / 2.05,
            borderWidth: outline, bottom: 0,
            left: (s * 1.4 + 24 - bodyW) / 2,
            backgroundColor: color,
          },
        ]}
      >
        <View style={[styles.bodyShine, { width: bodyW * 0.2, height: bodyH * 0.08, top: bodyH * 0.06, left: bodyW * 0.12, borderRadius: bodyH * 0.04 }]} />
        <View style={[styles.bodyShine2, { width: bodyW * 0.1, height: bodyH * 0.04, top: bodyH * 0.17, left: bodyW * 0.1, borderRadius: bodyH * 0.02 }]} />

        {/* Belly */}
        <View style={[styles.belly, {
          width: bodyW * 0.5, height: bodyH * 0.4,
          borderRadius: bodyW * 0.25,
          backgroundColor: bellyColor,
          bottom: bodyH * 0.08, left: bodyW * 0.25,
        }]} />

        {/* Eyes */}
        <Animated.View style={[styles.eyeOuter, { width: eyeW, height: eyeH, borderRadius: eyeW / 2, borderWidth: outline, top: bodyH * 0.2, left: bodyW * 0.13, transform: [{ rotate: '-4deg' }, { scaleY: blinkAnim }] }]}>
          <View style={[styles.pupil, { width: pupilSize, height: pupilSize, borderRadius: pupilSize / 2, marginTop: eyeH * 0.16, marginLeft: eyeW * 0.14 }]}>
            <View style={[styles.pupilHL, { width: pupilHL, height: pupilHL, borderRadius: pupilHL / 2, top: pupilSize * 0.08, left: pupilSize * 0.08 }]} />
            <View style={[styles.pupilHL2, { width: pupilHL * 0.5, height: pupilHL * 0.5, borderRadius: pupilHL * 0.25, bottom: pupilSize * 0.1, right: pupilSize * 0.1 }]} />
          </View>
        </Animated.View>
        <Animated.View style={[styles.eyeOuter, { width: eyeW, height: eyeH, borderRadius: eyeW / 2, borderWidth: outline, top: bodyH * 0.2, right: bodyW * 0.13, transform: [{ rotate: '4deg' }, { scaleY: blinkAnim }] }]}>
          <View style={[styles.pupil, { width: pupilSize, height: pupilSize, borderRadius: pupilSize / 2, marginTop: eyeH * 0.16, marginLeft: eyeW * 0.14 }]}>
            <View style={[styles.pupilHL, { width: pupilHL, height: pupilHL, borderRadius: pupilHL / 2, top: pupilSize * 0.08, left: pupilSize * 0.08 }]} />
            <View style={[styles.pupilHL2, { width: pupilHL * 0.5, height: pupilHL * 0.5, borderRadius: pupilHL * 0.25, bottom: pupilSize * 0.1, right: pupilSize * 0.1 }]} />
          </View>
        </Animated.View>

        {/* Nose */}
        <View style={[styles.nose, {
          width: s * 0.11, height: s * 0.08,
          borderRadius: s * 0.055,
          bottom: bodyH * 0.3,
          left: bodyW * 0.5 - s * 0.055,
        }]}>
          <View style={{ position: 'absolute', width: s * 0.04, height: s * 0.03, borderRadius: s * 0.02, backgroundColor: 'rgba(255,255,255,0.5)', top: s * 0.012, left: s * 0.02 }} />
        </View>

        {/* Whiskers */}
        <View style={[styles.whisker, { width: s * 0.16, height: Math.max(1, outline * 0.4), bottom: bodyH * 0.32, left: bodyW * 0.03, transform: [{ rotate: '-5deg' }] }]} />
        <View style={[styles.whisker, { width: s * 0.16, height: Math.max(1, outline * 0.4), bottom: bodyH * 0.28, left: bodyW * 0.02, transform: [{ rotate: '8deg' }] }]} />
        <View style={[styles.whisker, { width: s * 0.16, height: Math.max(1, outline * 0.4), bottom: bodyH * 0.32, right: bodyW * 0.03, transform: [{ rotate: '5deg' }] }]} />
        <View style={[styles.whisker, { width: s * 0.16, height: Math.max(1, outline * 0.4), bottom: bodyH * 0.28, right: bodyW * 0.02, transform: [{ rotate: '-8deg' }] }]} />

        {/* Cheeks */}
        <View style={[styles.cheek, { width: cheekSize, height: cheekSize * 0.5, borderRadius: cheekSize / 2, bottom: bodyH * 0.22, left: bodyW * 0.05 }]} />
        <View style={[styles.cheek, { width: cheekSize, height: cheekSize * 0.5, borderRadius: cheekSize / 2, bottom: bodyH * 0.22, right: bodyW * 0.05 }]} />

        {/* Mouth */}
        {showSmoothie ? (
          <View style={[styles.sippingMouth, { width: s * 0.14, height: s * 0.14, bottom: bodyH * 0.1, left: bodyW * 0.5 - s * 0.07, borderRadius: s * 0.07, borderWidth: outline * 0.65 }]} />
        ) : (
          <View style={[styles.mouth, { width: s * 0.28, height: s * 0.12, bottom: bodyH * 0.1, left: bodyW * 0.5 - (s * 0.28) / 2 + s * 0.02, borderBottomLeftRadius: s * 0.04, borderBottomRightRadius: s * 0.14, borderTopLeftRadius: s * 0.02, borderTopRightRadius: s * 0.02, borderWidth: outline * 0.65, transform: [{ rotate: '-3deg' }] }]}>
            <View style={[styles.tooth, { width: s * 0.05, height: s * 0.04, top: -1, right: s * 0.05 }]} />
          </View>
        )}
      </View>

      {/* Hat */}
      {hatColor !== 'none' && (
        <View
          style={[
            styles.hat,
            {
              width: s * 0.76, height: s * 0.3,
              borderTopLeftRadius: s * 0.36, borderTopRightRadius: s * 0.36,
              borderWidth: outline,
              top: earH * 0.55, left: (s * 1.4 + 24 - s * 0.76) / 2,
              backgroundColor: hatColor,
            },
          ]}
        >
          <View style={[styles.hatBrim, { width: s * 0.95, height: s * 0.065, bottom: -s * 0.015, left: -s * 0.09, borderRadius: s * 0.033, backgroundColor: hatColor, borderWidth: outline * 0.75 }]} />
          <View style={[styles.hatBand, { width: s * 0.76, height: s * 0.065, bottom: s * 0.035, left: -outline, backgroundColor: hatBandColor }]} />
          <View style={[styles.hatShine, { width: s * 0.22, height: s * 0.07, top: s * 0.03, left: s * 0.06, borderRadius: s * 0.035 }]} />
        </View>
      )}

      {/* Smoothie */}
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

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ear: {
    position: 'absolute',
    zIndex: -1,
    overflow: 'hidden',
  },
  tail: {
    position: 'absolute',
    zIndex: -2,
    overflow: 'hidden',
  },
  body: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    overflow: 'visible',
    alignItems: 'center',
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  bodyShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.55)',
    zIndex: 1,
  },
  bodyShine2: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
    zIndex: 1,
  },
  belly: {
    position: 'absolute',
    opacity: 0.55,
  },
  eyeOuter: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderColor: '#1A1A2E',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    zIndex: 5,
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
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  nose: {
    position: 'absolute',
    backgroundColor: '#1A1A2E',
    zIndex: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  whisker: {
    position: 'absolute',
    backgroundColor: 'rgba(26,26,46,0.25)',
    zIndex: 6,
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
    backgroundColor: 'rgba(255,255,255,0.45)',
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
