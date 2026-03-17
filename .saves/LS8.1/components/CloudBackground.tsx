import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { GameColors } from '@/constants/colors';
import { SCREEN, scale } from '@/constants/layout';

interface Cloud {
  id: number;
  x: number;
  y: number;
  scale: number;
  speed: number;
  opacity: number;
}

function generateClouds(count: number): Cloud[] {
  const clouds: Cloud[] = [];
  for (let i = 0; i < count; i++) {
    clouds.push({
      id: i,
      x: Math.random() * SCREEN.width * 1.5,
      y: 40 + Math.random() * (SCREEN.height * 0.35),
      scale: 0.5 + Math.random() * 0.8,
      speed: 0.3 + Math.random() * 0.5,
      opacity: 0.5 + Math.random() * 0.5,
    });
  }
  return clouds;
}

const CloudShape = React.memo(({ cloud, animValue }: { cloud: Cloud; animValue: Animated.Value }) => {
  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [cloud.x, cloud.x - 60 * cloud.speed],
  });

  return (
    <Animated.View
      style={[
        styles.cloud,
        {
          top: cloud.y,
          opacity: cloud.opacity,
          transform: [
            { translateX },
            { scale: cloud.scale },
          ],
        },
      ]}
    >
      <View style={styles.cloudShadow} />
      <View style={styles.cloudPart1} />
      <View style={styles.cloudPart2} />
      <View style={styles.cloudHighlight} />
    </Animated.View>
  );
});

export default function CloudBackground() {
  const clouds = useMemo(() => generateClouds(4), []);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [animValue]);

  return (
    <View style={styles.container} pointerEvents="none">
      {clouds.map(cloud => (
        <CloudShape key={cloud.id} cloud={cloud} animValue={animValue} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  cloud: {
    position: 'absolute',
    width: scale(100),
    height: scale(45),
  },
  cloudShadow: {
    position: 'absolute',
    width: scale(65),
    height: scale(22),
    borderRadius: scale(11),
    backgroundColor: 'rgba(120,180,210,0.25)',
    left: scale(15),
    top: scale(22),
  },
  cloudPart1: {
    position: 'absolute',
    width: scale(60),
    height: scale(35),
    borderRadius: scale(18),
    backgroundColor: GameColors.cloudWhite,
    left: scale(5),
    top: scale(4),
  },
  cloudPart2: {
    position: 'absolute',
    width: scale(70),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: GameColors.cloudWhite,
    left: scale(20),
    top: scale(9),
  },
  cloudHighlight: {
    position: 'absolute',
    width: scale(40),
    height: scale(14),
    borderRadius: scale(7),
    backgroundColor: 'rgba(255,255,255,0.6)',
    left: scale(18),
    top: scale(5),
  },
});
