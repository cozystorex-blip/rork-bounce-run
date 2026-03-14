import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SkinDefinition } from '@/constants/skins';
import { scale } from '@/constants/layout';

interface BlobCharacterProps {
  skin: SkinDefinition;
  size: number;
  scaleAnim?: Animated.Value;
  rotateAnim?: Animated.Value;
  isDead?: boolean;
}

function BlobCharacterInner({ skin, size, scaleAnim, rotateAnim, isDead }: BlobCharacterProps) {
  const eyeSize = size * 0.18;
  const pupilSize = eyeSize * 0.5;
  const cheekSize = size * 0.12;
  const mouthWidth = size * 0.22;

  const containerStyle = [
    styles.container,
    { width: size, height: size },
  ];

  const animatedStyle = scaleAnim || rotateAnim ? {
    transform: [
      ...(scaleAnim ? [{ scale: scaleAnim }] : []),
      ...(rotateAnim ? [{ rotate: rotateAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-30deg', '30deg'] }) }] : []),
    ],
  } : {};

  const body = (
    <View style={containerStyle}>
      <View style={[styles.body, {
        width: size * 0.82,
        height: size * 0.82,
        borderRadius: size * 0.36,
        backgroundColor: skin.bodyColor,
        borderWidth: scale(2.5),
        borderColor: skin.accentColor,
      }]}>
        <View style={[styles.bodyHighlight, {
          width: size * 0.35,
          height: size * 0.18,
          borderRadius: size * 0.12,
          top: size * 0.08,
          left: size * 0.12,
        }]} />

        <View style={[styles.eyeContainer, { top: size * 0.2, gap: size * 0.12 }]}>
          <View style={[styles.eye, {
            width: eyeSize,
            height: eyeSize * 1.15,
            borderRadius: eyeSize * 0.5,
            backgroundColor: '#FFFFFF',
            borderWidth: scale(1.5),
            borderColor: skin.eyeColor,
          }]}>
            <View style={[styles.pupil, {
              width: pupilSize,
              height: pupilSize,
              borderRadius: pupilSize / 2,
              backgroundColor: skin.eyeColor,
              bottom: isDead ? undefined : eyeSize * 0.15,
            }]}>
              <View style={[styles.pupilHighlight, {
                width: pupilSize * 0.35,
                height: pupilSize * 0.35,
                borderRadius: pupilSize * 0.175,
              }]} />
            </View>
          </View>
          <View style={[styles.eye, {
            width: eyeSize,
            height: eyeSize * 1.15,
            borderRadius: eyeSize * 0.5,
            backgroundColor: '#FFFFFF',
            borderWidth: scale(1.5),
            borderColor: skin.eyeColor,
          }]}>
            <View style={[styles.pupil, {
              width: pupilSize,
              height: pupilSize,
              borderRadius: pupilSize / 2,
              backgroundColor: skin.eyeColor,
              bottom: isDead ? undefined : eyeSize * 0.15,
            }]}>
              <View style={[styles.pupilHighlight, {
                width: pupilSize * 0.35,
                height: pupilSize * 0.35,
                borderRadius: pupilSize * 0.175,
              }]} />
            </View>
          </View>
        </View>

        <View style={[styles.cheekContainer, { top: size * 0.42, gap: size * 0.28 }]}>
          <View style={[styles.cheek, {
            width: cheekSize,
            height: cheekSize * 0.6,
            borderRadius: cheekSize * 0.3,
            backgroundColor: skin.cheekColor,
          }]} />
          <View style={[styles.cheek, {
            width: cheekSize,
            height: cheekSize * 0.6,
            borderRadius: cheekSize * 0.3,
            backgroundColor: skin.cheekColor,
          }]} />
        </View>

        {isDead ? (
          <View style={[styles.mouth, { top: size * 0.52, width: mouthWidth }]}>
            <View style={[styles.deadMouth, {
              width: mouthWidth * 0.7,
              height: scale(2),
              backgroundColor: skin.eyeColor,
              borderRadius: scale(1),
            }]} />
          </View>
        ) : (
          <View style={[styles.mouth, { top: size * 0.5 }]}>
            <View style={[styles.smileMouth, {
              width: mouthWidth * 0.6,
              height: mouthWidth * 0.3,
              borderBottomLeftRadius: mouthWidth * 0.3,
              borderBottomRightRadius: mouthWidth * 0.3,
              backgroundColor: skin.eyeColor,
            }]} />
          </View>
        )}
      </View>
    </View>
  );

  if (scaleAnim || rotateAnim) {
    return (
      <Animated.View style={animatedStyle}>
        {body}
      </Animated.View>
    );
  }

  return body;
}

export const BlobCharacter = React.memo(BlobCharacterInner);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  bodyHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  eyeContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pupil: {
    position: 'absolute',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 1,
    paddingRight: 1,
  },
  pupilHighlight: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  cheekContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cheek: {
    opacity: 0.5,
  },
  mouth: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadMouth: {},
  smileMouth: {},
});
