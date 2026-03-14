import { Audio } from 'expo-av';
import { Platform } from 'react-native';

class AudioManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private musicSound: Audio.Sound | null = null;
  private musicEnabled: boolean = true;
  private initialized: boolean = false;

  async init() {
    if (this.initialized) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        allowsRecordingIOS: false,
      });
      this.initialized = true;
      console.log('[Audio] Initialized');
    } catch (e) {
      console.warn('[Audio] Init failed:', e);
    }
  }

  async playPop() {
    if (Platform.OS === 'web') return;
    try {
      await this.init();
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b1f7e.mp3' },
        { volume: 0.3, shouldPlay: true }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          void sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('[Audio] Pop failed:', e);
    }
  }

  async playScore() {
    if (Platform.OS === 'web') return;
    try {
      await this.init();
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b1f7e.mp3' },
        { volume: 0.4, shouldPlay: true, rate: 1.3 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          void sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('[Audio] Score sound failed:', e);
    }
  }

  async playDeath() {
    if (Platform.OS === 'web') return;
    try {
      await this.init();
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b1f7e.mp3' },
        { volume: 0.5, shouldPlay: true, rate: 0.6 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          void sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn('[Audio] Death sound failed:', e);
    }
  }

  async stopMusic() {
    try {
      if (this.musicSound) {
        await this.musicSound.stopAsync();
        await this.musicSound.unloadAsync();
        this.musicSound = null;
      }
    } catch (e) {
      console.warn('[Audio] Stop music failed:', e);
    }
  }

  async toggleMusic(): Promise<boolean> {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      await this.stopMusic();
    }
    return this.musicEnabled;
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  async cleanup() {
    await this.stopMusic();
    for (const sound of this.sounds.values()) {
      try { await sound.unloadAsync(); } catch { /* ignore */ }
    }
    this.sounds.clear();
  }
}

export const audioManager = new AudioManager();
