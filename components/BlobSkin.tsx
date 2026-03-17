import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SkinData } from '@/constants/skins';

interface BlobSkinProps {
  skin: SkinData;
  size?: number;
  animated?: boolean;
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default React.memo(function BlobSkin({ skin, size = 80, animated = true }: BlobSkinProps) {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const squishAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const earWiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -4, duration: 800, useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    const squishLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(squishAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(squishAnim, { toValue: 0.97, duration: 700, useNativeDriver: true }),
      ])
    );
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(blinkAnim, { toValue: 0.08, duration: 70, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.delay(180),
        Animated.timing(blinkAnim, { toValue: 0.08, duration: 55, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 55, useNativeDriver: true }),
      ])
    );
    const earLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(3500),
        Animated.timing(earWiggle, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(earWiggle, { toValue: -0.5, duration: 100, useNativeDriver: true }),
        Animated.timing(earWiggle, { toValue: 0, duration: 100, useNativeDriver: true }),
      ])
    );
    bobLoop.start();
    squishLoop.start();
    blinkLoop.start();
    earLoop.start();
    return () => { bobLoop.stop(); squishLoop.stop(); blinkLoop.stop(); earLoop.stop(); };
  }, [bobAnim, squishAnim, blinkAnim, earWiggle, animated]);

  const s = size;
  const bodyW = s * 1.25;
  const bodyH = s * 1.1;
  const eyeW = Math.round(s * 0.32);
  const eyeH = Math.round(s * 0.36);
  const pupilSize = Math.round(s * 0.2);
  const pupilHL = Math.round(s * 0.09);
  const outline = Math.round(Math.max(2.5, s * 0.055));
  const cheekSize = s * 0.16;
  const cheekColor = skin.cheekColor ?? 'rgba(255,150,150,0.35)';
  const armW = s * 0.18;
  const armH = s * 0.14;
  const armColor = skin.armColor ?? adjustColor(skin.bodyColor, -25);
  const noseColor = skin.noseColor ?? '#1A1A2E';
  const bellyColor = skin.bellyColor ?? adjustColor(skin.bodyColor, 40);
  const earColor = skin.earColor ?? skin.bodyColor;
  const earInner = skin.earInnerColor ?? adjustColor(skin.bodyColor, 50);
  const wrapW = s * 1.5 + 14;
  const wrapH = s * 1.45 + 16;

  const earWiggleRotL = earWiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['8deg', '0deg', '-12deg'],
  });
  const earWiggleRotR = earWiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '12deg'],
  });

  const renderEars = () => {
    const EarWrapper = animated ? Animated.View : View;

    if (skin.earStyle === 'cat') {
      const earW = s * 0.28;
      const earH = s * 0.34;
      return (
        <>
          <EarWrapper style={[ls.ear, { width: earW, height: earH, top: -earH * 0.12, left: (wrapW - bodyW) / 2 + bodyW * 0.1, backgroundColor: earColor, borderTopLeftRadius: earW * 0.15, borderTopRightRadius: earW * 0.85, borderBottomLeftRadius: earW * 0.3, borderBottomRightRadius: earW * 0.3, borderWidth: outline, transform: [{ rotate: animated ? earWiggleRotL as any : '-18deg' }] }]}>
            <View style={[ls.earInner, { width: earW * 0.5, height: earH * 0.5, top: earH * 0.15, left: earW * 0.25, backgroundColor: earInner, borderTopLeftRadius: earW * 0.1, borderTopRightRadius: earW * 0.45, borderBottomRightRadius: earW * 0.1 }]} />
          </EarWrapper>
          <EarWrapper style={[ls.ear, { width: earW, height: earH, top: -earH * 0.12, right: (wrapW - bodyW) / 2 + bodyW * 0.1, backgroundColor: earColor, borderTopLeftRadius: earW * 0.85, borderTopRightRadius: earW * 0.15, borderBottomLeftRadius: earW * 0.3, borderBottomRightRadius: earW * 0.3, borderWidth: outline, transform: [{ rotate: animated ? earWiggleRotR as any : '18deg' }] }]}>
            <View style={[ls.earInner, { width: earW * 0.5, height: earH * 0.5, top: earH * 0.15, right: earW * 0.25, backgroundColor: earInner, borderTopRightRadius: earW * 0.1, borderTopLeftRadius: earW * 0.45, borderBottomLeftRadius: earW * 0.1 }]} />
          </EarWrapper>
        </>
      );
    }

    if (skin.earStyle === 'bear') {
      const earR = s * 0.2;
      return (
        <>
          <EarWrapper style={[ls.ear, { width: earR * 2, height: earR * 2, top: -earR * 0.15, left: (wrapW - bodyW) / 2 + bodyW * 0.06, backgroundColor: earColor, borderRadius: earR, borderWidth: outline, transform: [{ rotate: animated ? earWiggleRotL as any : '-8deg' }] }]}>
            <View style={[ls.earInner, { width: earR * 1.1, height: earR * 1.1, borderRadius: earR * 0.55, backgroundColor: earInner, top: earR * 0.35, left: earR * 0.45 }]} />
          </EarWrapper>
          <EarWrapper style={[ls.ear, { width: earR * 2, height: earR * 2, top: -earR * 0.15, right: (wrapW - bodyW) / 2 + bodyW * 0.06, backgroundColor: earColor, borderRadius: earR, borderWidth: outline, transform: [{ rotate: animated ? earWiggleRotR as any : '8deg' }] }]}>
            <View style={[ls.earInner, { width: earR * 1.1, height: earR * 1.1, borderRadius: earR * 0.55, backgroundColor: earInner, top: earR * 0.35, right: earR * 0.45 }]} />
          </EarWrapper>
        </>
      );
    }

    if (skin.earStyle === 'bunny') {
      const earW = s * 0.19;
      const earH = s * 0.5;
      return (
        <>
          <EarWrapper style={[ls.ear, { width: earW, height: earH, top: -earH * 0.38, left: (wrapW - bodyW) / 2 + bodyW * 0.18, backgroundColor: earColor, borderRadius: earW / 2, borderWidth: outline, transform: [{ rotate: animated ? earWiggleRotL as any : '-14deg' }] }]}>
            <View style={[ls.earInner, { width: earW * 0.5, height: earH * 0.6, borderRadius: earW * 0.25, backgroundColor: earInner, top: earH * 0.12, left: earW * 0.25 }]} />
          </EarWrapper>
          <EarWrapper style={[ls.ear, { width: earW, height: earH, top: -earH * 0.38, right: (wrapW - bodyW) / 2 + bodyW * 0.18, backgroundColor: earColor, borderRadius: earW / 2, borderWidth: outline, transform: [{ rotate: animated ? earWiggleRotR as any : '14deg' }] }]}>
            <View style={[ls.earInner, { width: earW * 0.5, height: earH * 0.6, borderRadius: earW * 0.25, backgroundColor: earInner, top: earH * 0.12, right: earW * 0.25 }]} />
          </EarWrapper>
        </>
      );
    }

    if (skin.earStyle === 'fox') {
      const earW = s * 0.3;
      const earH = s * 0.38;
      return (
        <>
          <EarWrapper style={[ls.ear, { width: earW, height: earH, top: -earH * 0.15, left: (wrapW - bodyW) / 2 + bodyW * 0.05, backgroundColor: earColor, borderTopLeftRadius: earW * 0.15, borderTopRightRadius: earW * 0.85, borderBottomLeftRadius: earW * 0.25, borderBottomRightRadius: earW * 0.25, borderWidth: outline, transform: [{ rotate: animated ? earWiggleRotL as any : '-22deg' }] }]}>
            <View style={[ls.earInner, { width: earW * 0.45, height: earH * 0.45, top: earH * 0.18, left: earW * 0.28, backgroundColor: earInner, borderTopRightRadius: earW * 0.4, borderBottomRightRadius: earW * 0.08 }]} />
          </EarWrapper>
          <EarWrapper style={[ls.ear, { width: earW, height: earH, top: -earH * 0.15, right: (wrapW - bodyW) / 2 + bodyW * 0.05, backgroundColor: earColor, borderTopRightRadius: earW * 0.15, borderTopLeftRadius: earW * 0.85, borderBottomRightRadius: earW * 0.25, borderBottomLeftRadius: earW * 0.25, borderWidth: outline, transform: [{ rotate: animated ? earWiggleRotR as any : '22deg' }] }]}>
            <View style={[ls.earInner, { width: earW * 0.45, height: earH * 0.45, top: earH * 0.18, right: earW * 0.28, backgroundColor: earInner, borderTopLeftRadius: earW * 0.4, borderBottomLeftRadius: earW * 0.08 }]} />
          </EarWrapper>
        </>
      );
    }

    if (skin.earStyle === 'pointy') {
      const earW = s * 0.24;
      const earH = s * 0.4;
      return (
        <>
          <EarWrapper style={[ls.ear, { width: earW, height: earH, top: -earH * 0.18, left: (wrapW - bodyW) / 2 + bodyW * 0.08, backgroundColor: earColor, borderTopLeftRadius: earW * 0.1, borderTopRightRadius: earW * 0.9, borderBottomLeftRadius: earW * 0.3, borderBottomRightRadius: earW * 0.3, borderWidth: outline, transform: [{ rotate: animated ? earWiggleRotL as any : '-16deg' }] }]}>
            <View style={[ls.earInner, { width: earW * 0.42, height: earH * 0.42, top: earH * 0.22, left: earW * 0.3, backgroundColor: earInner, borderTopRightRadius: earW * 0.4 }]} />
          </EarWrapper>
          <EarWrapper style={[ls.ear, { width: earW, height: earH, top: -earH * 0.18, right: (wrapW - bodyW) / 2 + bodyW * 0.08, backgroundColor: earColor, borderTopRightRadius: earW * 0.1, borderTopLeftRadius: earW * 0.9, borderBottomRightRadius: earW * 0.3, borderBottomLeftRadius: earW * 0.3, borderWidth: outline, transform: [{ rotate: animated ? earWiggleRotR as any : '16deg' }] }]}>
            <View style={[ls.earInner, { width: earW * 0.42, height: earH * 0.42, top: earH * 0.22, right: earW * 0.3, backgroundColor: earInner, borderTopLeftRadius: earW * 0.4 }]} />
          </EarWrapper>
        </>
      );
    }

    return null;
  };

  const renderEyes = () => {
    const eyeRotL = skin.eyeStyle === 'angry' ? '-8deg' : skin.eyeStyle === 'intense' ? '-5deg' : '-3deg';
    const eyeRotR = skin.eyeStyle === 'angry' ? '8deg' : skin.eyeStyle === 'intense' ? '5deg' : '3deg';

    const EyeWrapper = animated ? Animated.View : View;
    const eyeTransformL = animated
      ? [{ rotate: eyeRotL }, { scaleY: blinkAnim }]
      : [{ rotate: eyeRotL }];
    const eyeTransformR = animated
      ? [{ rotate: eyeRotR }, { scaleY: blinkAnim }]
      : [{ rotate: eyeRotR }];

    const irisColor = skin.eyeColor ?? '#1A1A2E';

    return (
      <>
        <EyeWrapper style={[ls.eyeOuter, { width: eyeW, height: eyeH, borderRadius: Math.round(eyeW / 2), borderWidth: outline, top: bodyH * 0.2, left: bodyW * 0.13, transform: eyeTransformL as any }]}>
          <View style={[ls.pupil, { width: pupilSize, height: pupilSize, borderRadius: Math.round(pupilSize / 2), backgroundColor: irisColor, marginTop: Math.round(eyeH * 0.18), marginLeft: Math.round(eyeW * 0.15) }]}>
            <View style={[ls.pupilHL, { width: pupilHL, height: pupilHL, borderRadius: Math.round(pupilHL / 2), top: Math.round(pupilSize * 0.08), left: Math.round(pupilSize * 0.08) }]} />
            <View style={[ls.pupilHL2, { width: Math.round(pupilHL * 0.5), height: Math.round(pupilHL * 0.5), borderRadius: Math.round(pupilHL * 0.25), bottom: Math.round(pupilSize * 0.1), right: Math.round(pupilSize * 0.1) }]} />
          </View>
        </EyeWrapper>
        <EyeWrapper style={[ls.eyeOuter, { width: eyeW, height: eyeH, borderRadius: Math.round(eyeW / 2), borderWidth: outline, top: bodyH * 0.2, right: bodyW * 0.13, transform: eyeTransformR as any }]}>
          <View style={[ls.pupil, { width: pupilSize, height: pupilSize, borderRadius: Math.round(pupilSize / 2), backgroundColor: irisColor, marginTop: Math.round(eyeH * 0.18), marginLeft: Math.round(eyeW * 0.15) }]}>
            <View style={[ls.pupilHL, { width: pupilHL, height: pupilHL, borderRadius: Math.round(pupilHL / 2), top: Math.round(pupilSize * 0.08), left: Math.round(pupilSize * 0.08) }]} />
            <View style={[ls.pupilHL2, { width: Math.round(pupilHL * 0.5), height: Math.round(pupilHL * 0.5), borderRadius: Math.round(pupilHL * 0.25), bottom: Math.round(pupilSize * 0.1), right: Math.round(pupilSize * 0.1) }]} />
          </View>
        </EyeWrapper>
        {(skin.eyeStyle === 'angry' || skin.eyeStyle === 'intense') && (
          <>
            <View style={[ls.brow, { top: bodyH * 0.14, left: bodyW * 0.09, width: eyeW * 0.95, height: outline * 1.8, borderRadius: outline, transform: [{ rotate: skin.eyeStyle === 'angry' ? '16deg' : '10deg' }] }]} />
            <View style={[ls.brow, { top: bodyH * 0.14, right: bodyW * 0.09, width: eyeW * 0.95, height: outline * 1.8, borderRadius: outline, transform: [{ rotate: skin.eyeStyle === 'angry' ? '-16deg' : '-10deg' }] }]} />
          </>
        )}
        {skin.hasGlasses && renderGlasses()}
      </>
    );
  };

  const renderGlasses = () => {
    const glassSize = eyeW * 1.15;
    const bridgeW = s * 0.07;
    return (
      <>
        <View style={[ls.glassFrame, { width: glassSize, height: glassSize * 0.9, borderRadius: glassSize / 2, borderWidth: outline * 0.85, top: bodyH * 0.17, left: bodyW * 0.09 }]} />
        <View style={[ls.glassFrame, { width: glassSize, height: glassSize * 0.9, borderRadius: glassSize / 2, borderWidth: outline * 0.85, top: bodyH * 0.17, right: bodyW * 0.09 }]} />
        <View style={[ls.glassBridge, { width: bridgeW, height: outline * 1.1, top: bodyH * 0.3, left: bodyW * 0.5 - bridgeW / 2 }]} />
      </>
    );
  };

  const renderNose = () => {
    const noseW = s * 0.12;
    const noseH = s * 0.09;
    return (
      <View style={[ls.nose, {
        width: noseW,
        height: noseH,
        borderRadius: noseW / 2,
        backgroundColor: noseColor,
        bottom: bodyH * 0.3,
        left: bodyW * 0.5 - noseW / 2,
      }]}>
        <View style={[ls.noseShine, { width: noseW * 0.35, height: noseH * 0.4, borderRadius: noseW * 0.18, top: noseH * 0.12, left: noseW * 0.18 }]} />
      </View>
    );
  };

  const renderWhiskers = () => {
    if (!skin.whiskers) return null;
    const wLen = s * 0.18;
    const wThick = Math.max(1, outline * 0.4);
    return (
      <>
        <View style={[ls.whisker, { width: wLen, height: wThick, bottom: bodyH * 0.32, left: bodyW * 0.02, transform: [{ rotate: '-5deg' }] }]} />
        <View style={[ls.whisker, { width: wLen, height: wThick, bottom: bodyH * 0.28, left: bodyW * 0.01, transform: [{ rotate: '8deg' }] }]} />
        <View style={[ls.whisker, { width: wLen, height: wThick, bottom: bodyH * 0.32, right: bodyW * 0.02, transform: [{ rotate: '5deg' }] }]} />
        <View style={[ls.whisker, { width: wLen, height: wThick, bottom: bodyH * 0.28, right: bodyW * 0.01, transform: [{ rotate: '-8deg' }] }]} />
      </>
    );
  };

  const renderMouth = () => {
    if (skin.mouthStyle === 'tongue') {
      return (
        <View style={[ls.mouthOpen, { bottom: bodyH * 0.1, left: bodyW * 0.32, width: s * 0.34, height: s * 0.17, borderRadius: s * 0.1, borderWidth: outline * 0.7 }]}>
          <View style={[ls.tongue, { width: s * 0.16, height: s * 0.12, borderRadius: s * 0.08, bottom: -s * 0.03 }]} />
        </View>
      );
    }
    if (skin.mouthStyle === 'grin') {
      return (
        <View style={[ls.mouthGrin, { bottom: bodyH * 0.1, left: bodyW * 0.25, width: s * 0.48, height: s * 0.14, borderBottomLeftRadius: s * 0.14, borderBottomRightRadius: s * 0.14, borderWidth: outline * 0.7 }]}>
          <View style={[ls.tooth, { width: s * 0.06, height: s * 0.05, left: s * 0.12 }]} />
          <View style={[ls.tooth, { width: s * 0.06, height: s * 0.05, right: s * 0.12 }]} />
        </View>
      );
    }
    if (skin.mouthStyle === 'cute') {
      return (
        <View style={{ position: 'absolute', bottom: bodyH * 0.12, left: bodyW * 0.3, width: s * 0.38, flexDirection: 'row', justifyContent: 'center', gap: s * 0.02 }}>
          <View style={[ls.mouthCuteW, { width: s * 0.13, height: s * 0.08, borderBottomLeftRadius: s * 0.08, borderBottomRightRadius: s * 0.01, borderWidth: outline * 0.6 }]} />
          <View style={[ls.mouthCuteW, { width: s * 0.13, height: s * 0.08, borderBottomLeftRadius: s * 0.01, borderBottomRightRadius: s * 0.08, borderWidth: outline * 0.6 }]} />
        </View>
      );
    }
    if (skin.mouthStyle === 'fierce') {
      return (
        <View style={[ls.mouthFierce, { bottom: bodyH * 0.11, left: bodyW * 0.28, width: s * 0.4, height: s * 0.11, borderRadius: s * 0.03, borderWidth: outline * 0.7 }]}>
          <View style={[ls.tooth, { width: s * 0.05, height: s * 0.05, left: s * 0.05 }]} />
          <View style={[ls.tooth, { width: s * 0.05, height: s * 0.05, right: s * 0.05 }]} />
          <View style={[ls.toothBottom, { width: s * 0.04, height: s * 0.04, left: s * 0.13 }]} />
        </View>
      );
    }
    return (
      <View style={[ls.mouthSmirk, { bottom: bodyH * 0.11, left: bodyW * 0.35, width: s * 0.26, height: s * 0.12, borderBottomLeftRadius: s * 0.04, borderBottomRightRadius: s * 0.14, borderTopLeftRadius: s * 0.02, borderTopRightRadius: s * 0.02, borderWidth: outline * 0.7, transform: [{ rotate: '-3deg' }] }]}>
        <View style={[ls.tooth, { width: s * 0.045, height: s * 0.04, top: -1, right: s * 0.05 }]} />
      </View>
    );
  };

  const renderBelly = () => {
    const bellyW = bodyW * 0.52;
    const bellyH = bodyH * 0.42;
    return (
      <View style={[ls.belly, {
        width: bellyW,
        height: bellyH,
        borderRadius: bellyW / 2,
        backgroundColor: bellyColor,
        bottom: bodyH * 0.08,
        left: bodyW * 0.5 - bellyW / 2,
      }]} />
    );
  };

  const renderCheeks = () => {
    return (
      <>
        <View style={[ls.cheek, { width: cheekSize, height: cheekSize * 0.5, borderRadius: cheekSize / 2, bottom: bodyH * 0.22, left: bodyW * 0.04, backgroundColor: cheekColor }]} />
        <View style={[ls.cheek, { width: cheekSize, height: cheekSize * 0.5, borderRadius: cheekSize / 2, bottom: bodyH * 0.22, right: bodyW * 0.04, backgroundColor: cheekColor }]} />
      </>
    );
  };

  const renderArms = () => {
    return (
      <>
        <View
          style={[ls.arm, {
            width: armW, height: armH, borderRadius: armW / 2,
            borderWidth: outline * 0.75, bottom: bodyH * 0.2,
            left: (wrapW - bodyW) / 2 - armW * 0.15,
            backgroundColor: armColor, transform: [{ rotate: '-14deg' }],
          }]}
        >
          <View style={[ls.armHand, { width: armW * 0.48, height: armH * 0.6, borderRadius: armW * 0.24, right: -armW * 0.05, backgroundColor: armColor, borderWidth: outline * 0.55 }]} />
        </View>
        <View
          style={[ls.arm, {
            width: armW, height: armH, borderRadius: armW / 2,
            borderWidth: outline * 0.75, bottom: bodyH * 0.2,
            right: (wrapW - bodyW) / 2 - armW * 0.15,
            backgroundColor: armColor, transform: [{ rotate: '14deg' }],
          }]}
        >
          <View style={[ls.armHand, { width: armW * 0.48, height: armH * 0.6, borderRadius: armW * 0.24, left: -armW * 0.05, backgroundColor: armColor, borderWidth: outline * 0.55 }]} />
        </View>
      </>
    );
  };

  const renderTail = () => {
    if (!skin.tailStyle) return null;
    const tailColor = skin.tailColor ?? adjustColor(skin.bodyColor, -15);

    if (skin.tailStyle === 'round') {
      const tailR = s * 0.1;
      return (
        <View style={[ls.tail, { width: tailR * 2, height: tailR * 2, borderRadius: tailR, backgroundColor: tailColor, borderWidth: outline * 0.7, right: (wrapW - bodyW) / 2 - tailR * 0.4, bottom: bodyH * 0.15 }]} />
      );
    }
    if (skin.tailStyle === 'fluffy') {
      const tailW = s * 0.25;
      const tailH = s * 0.2;
      return (
        <View style={[ls.tail, { width: tailW, height: tailH, borderRadius: tailW * 0.4, backgroundColor: tailColor, borderWidth: outline * 0.7, right: (wrapW - bodyW) / 2 - tailW * 0.3, bottom: bodyH * 0.12, transform: [{ rotate: '15deg' }] }]}>
          <View style={{ position: 'absolute', width: tailW * 0.5, height: tailH * 0.4, borderRadius: tailW * 0.25, backgroundColor: adjustColor(tailColor, 30), top: tailH * 0.15, left: tailW * 0.1 }} />
        </View>
      );
    }
    if (skin.tailStyle === 'long') {
      const tailW = s * 0.12;
      const tailH = s * 0.3;
      return (
        <View style={[ls.tail, { width: tailW, height: tailH, borderRadius: tailW / 2, backgroundColor: tailColor, borderWidth: outline * 0.6, right: (wrapW - bodyW) / 2 - tailW * 0.2, bottom: bodyH * 0.05, transform: [{ rotate: '25deg' }] }]}>
          <View style={{ position: 'absolute', width: tailW * 1.3, height: tailW * 1.3, borderRadius: tailW * 0.65, backgroundColor: tailColor, borderWidth: outline * 0.5, borderColor: '#1A1A2E', bottom: -tailW * 0.2, left: -tailW * 0.3 }} />
        </View>
      );
    }
    if (skin.tailStyle === 'curly') {
      const tailR = s * 0.12;
      return (
        <View style={[ls.tail, { width: tailR * 2.5, height: tailR * 2, borderRadius: tailR, backgroundColor: tailColor, borderWidth: outline * 0.65, right: (wrapW - bodyW) / 2 - tailR * 0.5, bottom: bodyH * 0.1, transform: [{ rotate: '10deg' }] }]} />
      );
    }
    return null;
  };

  const renderHat = () => {
    const hatH = s * 0.32;
    const hatW = s * 0.8;

    if (skin.hatStyle === 'none') return null;

    if (skin.hatStyle === 'hood') {
      return (
        <View style={[ls.hood, { width: bodyW * 0.95, height: hatH * 1.3, top: -hatH * 0.15, left: (wrapW - bodyW * 0.95) / 2, borderTopLeftRadius: bodyW * 0.45, borderTopRightRadius: bodyW * 0.45, backgroundColor: skin.hatColor, borderWidth: outline, borderBottomWidth: 0 }]}>
          <View style={[ls.hoodShine, { width: bodyW * 0.2, height: hatH * 0.3, top: hatH * 0.12, left: bodyW * 0.1, borderRadius: hatH * 0.15 }]} />
        </View>
      );
    }

    if (skin.hatStyle === 'spiky') {
      return (
        <View style={{ position: 'absolute', top: -hatH * 0.45, left: (wrapW - hatW) / 2, width: hatW, height: hatH * 1.1, alignItems: 'center' }}>
          <View style={[ls.colanderHat, { width: hatW * 0.85, height: hatH * 0.75, borderTopLeftRadius: hatW * 0.38, borderTopRightRadius: hatW * 0.38, backgroundColor: skin.hatColor, borderWidth: outline, borderBottomWidth: outline * 0.5, left: hatW * 0.075, top: hatH * 0.18 }]}>
            <View style={[ls.colanderShine, { width: hatW * 0.16, height: hatH * 0.18, top: hatH * 0.06, left: hatW * 0.07, borderRadius: hatH * 0.09 }]} />
          </View>
          <View style={[ls.colanderHandle, { width: s * 0.07, height: s * 0.16, backgroundColor: skin.hatColor, borderRadius: s * 0.035, top: 0, borderWidth: outline * 0.65, borderColor: '#1A1A2E' }]} />
        </View>
      );
    }

    if (skin.hatStyle === 'bow') {
      const bowW = s * 0.22;
      const bowH = s * 0.14;
      return (
        <View style={{ position: 'absolute', top: -s * 0.04, left: wrapW * 0.55, alignItems: 'center' }}>
          <View style={[ls.bowPart, { width: bowW, height: bowH, backgroundColor: skin.hatColor, borderRadius: bowW * 0.35, transform: [{ rotate: '-20deg' }], borderWidth: outline * 0.6, borderColor: '#1A1A2E' }]} />
          <View style={[ls.bowPart, { width: bowW, height: bowH, backgroundColor: skin.hatColor, borderRadius: bowW * 0.35, transform: [{ rotate: '20deg' }], borderWidth: outline * 0.6, borderColor: '#1A1A2E', marginTop: -bowH * 0.55 }]} />
          <View style={[ls.bowCenter, { width: bowH * 0.5, height: bowH * 0.5, borderRadius: bowH * 0.25, backgroundColor: adjustColor(skin.hatColor, -30), borderWidth: outline * 0.5, borderColor: '#1A1A2E', marginTop: -bowH * 0.65 }]} />
        </View>
      );
    }

    if (skin.hatStyle === 'ninja') {
      return (
        <>
          <View style={[ls.ninjaBand, { width: bodyW * 1.08, height: s * 0.13, top: bodyH * 0.08, left: (wrapW - bodyW * 1.08) / 2, backgroundColor: skin.hatColor, borderRadius: s * 0.045, borderWidth: outline * 0.75, borderColor: '#1A1A2E' }]}>
            <View style={[ls.ninjaBandShine, { width: bodyW * 0.2, height: s * 0.04, left: bodyW * 0.07, top: s * 0.02, borderRadius: s * 0.02 }]} />
          </View>
          <View style={[ls.ninjaTail, { width: s * 0.24, height: s * 0.06, top: bodyH * 0.1, right: -s * 0.08, backgroundColor: skin.hatColor, borderRadius: s * 0.03, borderWidth: outline * 0.45, borderColor: '#1A1A2E', transform: [{ rotate: '12deg' }] }]} />
        </>
      );
    }

    return (
      <View style={[ls.hat, { width: hatW, height: hatH, borderTopLeftRadius: hatW * 0.46, borderTopRightRadius: hatW * 0.46, borderWidth: outline, top: 0, left: (wrapW - hatW) / 2, backgroundColor: skin.hatColor, borderColor: '#1A1A2E' }]}>
        <View style={[ls.hatBrim, { width: hatW * 1.22, height: hatH * 0.2, bottom: -hatH * 0.04, left: -hatW * 0.11, borderRadius: hatH * 0.1, backgroundColor: skin.hatColor, borderWidth: outline * 0.75, borderColor: '#1A1A2E' }]} />
        <View style={[ls.hatBand, { width: hatW, height: hatH * 0.2, bottom: hatH * 0.1, left: -outline, backgroundColor: skin.hatBand }]} />
        <View style={[ls.hatShine, { width: hatW * 0.28, height: hatH * 0.24, top: hatH * 0.08, left: hatW * 0.07, borderRadius: hatH * 0.12 }]} />
      </View>
    );
  };

  const renderCape = () => {
    if (!skin.hasCape) return null;
    const capeW = bodyW * 0.65;
    const capeH = bodyH * 0.8;
    return (
      <View style={[ls.cape, { width: capeW, height: capeH, backgroundColor: skin.capeColor ?? '#CC2222', borderBottomLeftRadius: capeW * 0.3, borderBottomRightRadius: capeW * 0.45, borderWidth: outline * 0.75, borderColor: '#1A1A2E', right: (wrapW - bodyW) / 2 - capeW * 0.12, bottom: bodyH * 0.06 }]}>
        <View style={[ls.capeShine, { width: capeW * 0.18, height: capeH * 0.35, borderRadius: capeW * 0.09, left: capeW * 0.1, top: capeH * 0.1 }]} />
      </View>
    );
  };

  const renderMask = () => {
    if (!skin.maskColor) return null;
    return (
      <View style={[ls.mask, { width: bodyW * 0.68, height: s * 0.12, top: bodyH * 0.25, left: bodyW * 0.16, borderRadius: s * 0.06, backgroundColor: skin.maskColor, borderWidth: outline * 0.45, borderColor: '#1A1A2E' }]}>
        <View style={[ls.maskHoleL, { width: eyeW * 0.75, height: eyeH * 0.65, borderRadius: eyeW * 0.38, left: bodyW * 0.01 }]} />
        <View style={[ls.maskHoleR, { width: eyeW * 0.75, height: eyeH * 0.65, borderRadius: eyeW * 0.38, right: bodyW * 0.01 }]} />
      </View>
    );
  };

  const renderChestLetter = () => {
    if (!skin.chestLetter) return null;
    const badgeSize = s * 0.2;
    return (
      <View style={[ls.chestBadge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2, backgroundColor: skin.chestLetterBg ?? '#FFD84A', borderWidth: outline * 0.65, borderColor: '#1A1A2E', bottom: bodyH * 0.16, left: bodyW * 0.5 - badgeSize / 2 }]}>
        <Text style={[ls.chestLetterText, { fontSize: s * 0.11, lineHeight: s * 0.14 }]}>{skin.chestLetter}</Text>
      </View>
    );
  };

  const renderChain = () => {
    if (!skin.hasChain) return null;
    return (
      <View style={[ls.chain, { bottom: bodyH * 0.3, left: bodyW * 0.35, width: s * 0.26, height: s * 0.035, borderRadius: s * 0.018, borderWidth: outline * 0.35 }]} />
    );
  };

  const Wrapper = animated ? Animated.View : View;
  const wrapTransform = animated ? [{ translateY: bobAnim }, { scaleY: squishAnim }] : [];

  return (
    <Wrapper
      style={[
        ls.wrapper,
        {
          width: wrapW,
          height: wrapH,
          transform: wrapTransform as any,
        },
      ]}
    >
      {renderCape()}
      {renderTail()}
      {renderEars()}
      {renderHat()}
      {renderArms()}
      <View
        style={[
          ls.body,
          {
            width: bodyW,
            height: bodyH,
            borderRadius: bodyW / 1.95,
            borderWidth: outline,
            bottom: 0,
            left: (wrapW - bodyW) / 2,
            backgroundColor: skin.bodyColor,
          },
        ]}
      >
        <View style={[ls.bodyShine, { width: bodyW * 0.2, height: bodyH * 0.08, top: bodyH * 0.06, left: bodyW * 0.12, borderRadius: bodyH * 0.04 }]} />
        <View style={[ls.bodyShine2, { width: bodyW * 0.1, height: bodyH * 0.04, top: bodyH * 0.17, left: bodyW * 0.1, borderRadius: bodyH * 0.02 }]} />
        {renderBelly()}
        {renderMask()}
        {renderEyes()}
        {renderNose()}
        {renderWhiskers()}
        {renderCheeks()}
        {renderMouth()}
        {renderChestLetter()}
        {renderChain()}
      </View>
    </Wrapper>
  );
});

const ls = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  body: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    alignItems: 'center',
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
    overflow: 'visible',
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
    opacity: 0.6,
  },
  ear: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    zIndex: -1,
    overflow: 'hidden',
  },
  earInner: {
    position: 'absolute',
  },
  nose: {
    position: 'absolute',
    zIndex: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 2,
  },
  noseShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  whisker: {
    position: 'absolute',
    backgroundColor: 'rgba(26,26,46,0.25)',
    zIndex: 6,
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
  cheek: {
    position: 'absolute',
    opacity: 0.55,
  },
  brow: {
    position: 'absolute',
    backgroundColor: '#1A1A2E',
    zIndex: 6,
  },
  glassFrame: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    backgroundColor: 'rgba(200,220,255,0.2)',
    zIndex: 8,
  },
  glassBridge: {
    position: 'absolute',
    backgroundColor: '#1A1A2E',
    zIndex: 9,
  },
  mouthSmirk: {
    position: 'absolute',
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
    overflow: 'visible',
  },
  mouthOpen: {
    position: 'absolute',
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
    alignItems: 'center',
    overflow: 'visible',
  },
  tongue: {
    position: 'absolute',
    backgroundColor: '#FF6B8A',
  },
  mouthCuteW: {
    backgroundColor: 'transparent',
    borderColor: '#1A1A2E',
    borderTopWidth: 0,
  },
  mouthGrin: {
    position: 'absolute',
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
    overflow: 'visible',
  },
  mouthFierce: {
    position: 'absolute',
    backgroundColor: '#1A1A2E',
    borderColor: '#1A1A2E',
    overflow: 'visible',
  },
  tooth: {
    position: 'absolute',
    top: -1,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  toothBottom: {
    position: 'absolute',
    bottom: -1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  arm: {
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
  tail: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    zIndex: -2,
    overflow: 'hidden',
  },
  hood: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    overflow: 'hidden',
    zIndex: 2,
  },
  hoodShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  colanderHat: {
    position: 'absolute',
    borderColor: '#1A1A2E',
    overflow: 'hidden',
  },
  colanderShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  colanderHandle: {
    position: 'absolute',
    zIndex: 3,
  },
  bowPart: {
    zIndex: 10,
  },
  bowCenter: {
    zIndex: 11,
  },
  ninjaBand: {
    position: 'absolute',
    zIndex: 10,
    overflow: 'hidden',
  },
  ninjaBandShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  ninjaTail: {
    position: 'absolute',
    zIndex: 9,
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
  cape: {
    position: 'absolute',
    zIndex: -2,
    overflow: 'hidden',
  },
  capeShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  mask: {
    position: 'absolute',
    zIndex: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  maskHoleL: {
    backgroundColor: 'transparent',
  },
  maskHoleR: {
    backgroundColor: 'transparent',
  },
  chestBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  chestLetterText: {
    fontWeight: '900' as const,
    color: '#1A1A2E',
    textAlign: 'center',
  },
  chain: {
    position: 'absolute',
    backgroundColor: '#FFD84A',
    borderColor: '#CC9900',
    zIndex: 6,
  },
});
