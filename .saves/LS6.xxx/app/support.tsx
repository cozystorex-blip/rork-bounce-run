import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SupportPage() {
  const insets = useSafeAreaInsets();

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@rork.app?subject=Blob%20Dash%20Support');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Blob Dash</Text>
        <Text style={styles.subtitle}>Support & Information</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Game</Text>
          <Text style={styles.body}>
            Blob Dash is a fun and fast-paced arcade game where you control a bouncing blob, dodge obstacles, perform tricks, and dash your way to the highest score. Collect coins, unlock new skins, and explore different maps as you play.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Play</Text>
          <Text style={styles.body}>
            Tap the screen to make your blob jump and avoid obstacles. Perform tricks in the air to earn bonus points and coins. Use coins to unlock new blob skins and maps in the shop.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          <Text style={styles.body}>
            If you have questions, feedback, or need help with anything related to Blob Dash, please reach out to us:
          </Text>
          <TouchableOpacity style={styles.emailButton} onPress={handleEmailPress} activeOpacity={0.7}>
            <Text style={styles.emailButtonText}>support@rork.app</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <Text style={styles.body}>
            Blob Dash does not collect personal data. Any in-app purchases are processed securely through the App Store. We respect your privacy and do not share any information with third parties.
          </Text>
        </View>

        <Text style={styles.footer}>© {new Date().getFullYear()} Blob Dash. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#1A3A5C',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#6B8DAF',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1A3A5C',
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4A6A8A',
  },
  emailButton: {
    marginTop: 12,
    backgroundColor: '#4BA3D4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  emailButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  footer: {
    fontSize: 13,
    color: '#9BB5CC',
    textAlign: 'center',
    marginTop: 24,
  },
});
