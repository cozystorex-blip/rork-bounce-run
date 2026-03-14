import { Platform, AppState, AppStateStatus } from 'react-native';

let Audio: any = null;

try {
  Audio = require('expo-av').Audio;
} catch (e) {
  console.log('[AudioManager] expo-av not available:', e);
}

const POP_SOUNDS = [
  'https://cdn.pixabay.com/audio/2022/03/24/audio_805cb3251c.mp3',
  'https://cdn.pixabay.com/audio/2022/10/30/audio_b4b6771cae.mp3',
];

const GAME_MUSIC_URL = 'https://cdn.pixabay.com/audio/2022/07/05/audio_5c3dae4f71.mp3';

const SCORE_SOUND_URL = 'https://cdn.pixabay.com/audio/2022/03/15/audio_56ffa36a1a.mp3';

class AudioManager {
  private popSounds: any[] = [];
  private musicSound: any = null;
  private scoreSound: any = null;
  private loaded = false;
  private musicPlaying = false;
  private musicEnabled = true;
  private sfxEnabled = true;
  private popIndex = 0;

  private appStateSubscription: any = null;
  private wasPlayingBeforeBackground = false;

  async init(): Promise<void> {
    if (this.loaded || !Audio) return;
    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          allowsRecordingIOS: false,
        });
      }
      this.setupAppStateListener();
      this.loaded = true;
      console.log('[AudioManager] Initialized');
    } catch (e) {
      console.log('[AudioManager] Init failed:', e);
    }
  }

  private setupAppStateListener(): void {
    if (this.appStateSubscription) return;
    this.appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        this.wasPlayingBeforeBackground = this.musicPlaying;
        if (this.musicPlaying) {
          void this.pauseMusic();
        }
        console.log('[AudioManager] App backgrounded, paused music');
      } else if (nextState === 'active') {
        if (this.wasPlayingBeforeBackground && this.musicEnabled) {
          void this.resumeMusic();
          console.log('[AudioManager] App foregrounded, resumed music');
        }
      }
    });
  }

  async loadPopSounds(): Promise<void> {
    if (this.popSounds.length > 0 || !Audio) return;
    try {
      for (const uri of POP_SOUNDS) {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { volume: 0.6, shouldPlay: false }
        );
        this.popSounds.push(sound);
      }
      console.log('[AudioManager] Pop sounds loaded');
    } catch (e) {
      console.log('[AudioManager] Pop sounds load failed:', e);
    }
  }

  async loadScoreSound(): Promise<void> {
    if (this.scoreSound || !Audio) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: SCORE_SOUND_URL },
        { volume: 0.4, shouldPlay: false }
      );
      this.scoreSound = sound;
      console.log('[AudioManager] Score sound loaded');
    } catch (e) {
      console.log('[AudioManager] Score sound load failed:', e);
    }
  }

  async playPop(): Promise<void> {
    if (!this.sfxEnabled || this.popSounds.length === 0) return;
    try {
      const sound = this.popSounds[this.popIndex % this.popSounds.length];
      this.popIndex++;
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (e) {
      console.log('[AudioManager] Pop play failed:', e);
    }
  }

  async playScore(): Promise<void> {
    if (!this.sfxEnabled || !this.scoreSound) return;
    try {
      await this.scoreSound.setPositionAsync(0);
      await this.scoreSound.playAsync();
    } catch (e) {
      console.log('[AudioManager] Score play failed:', e);
    }
  }

  async loadMusic(): Promise<void> {
    if (this.musicSound || !Audio) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: GAME_MUSIC_URL },
        { volume: 0.25, isLooping: true, shouldPlay: false }
      );
      this.musicSound = sound;
      console.log('[AudioManager] Music loaded');
    } catch (e) {
      console.log('[AudioManager] Music load failed:', e);
    }
  }

  async startMusic(): Promise<void> {
    if (!this.musicEnabled || this.musicPlaying || !this.musicSound) return;
    try {
      if (Platform.OS === 'ios') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          allowsRecordingIOS: false,
        });
      }
      await this.musicSound.setPositionAsync(0);
      await this.musicSound.playAsync();
      this.musicPlaying = true;
      console.log('[AudioManager] Music started');
    } catch (e) {
      console.log('[AudioManager] Music start failed:', e);
    }
  }

  async resumeMusic(): Promise<void> {
    if (!this.musicEnabled || this.musicPlaying || !this.musicSound) return;
    try {
      await this.musicSound.playAsync();
      this.musicPlaying = true;
    } catch (e) {
      console.log('[AudioManager] Music resume failed:', e);
    }
  }

  async pauseMusic(): Promise<void> {
    if (!this.musicPlaying || !this.musicSound) return;
    try {
      await this.musicSound.pauseAsync();
      this.musicPlaying = false;
    } catch (e) {
      console.log('[AudioManager] Music pause failed:', e);
    }
  }

  async stopMusic(): Promise<void> {
    if (!this.musicSound) return;
    try {
      await this.musicSound.stopAsync();
      this.musicPlaying = false;
      console.log('[AudioManager] Music stopped');
    } catch (e) {
      console.log('[AudioManager] Music stop failed:', e);
    }
  }

  async toggleMusic(): Promise<boolean> {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      await this.stopMusic();
    } else {
      await this.startMusic();
    }
    return this.musicEnabled;
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
  }

  isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  isMusicPlaying(): boolean {
    return this.musicPlaying;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }
      for (const s of this.popSounds) {
        try { await s.unloadAsync(); } catch { /* ignore */ }
      }
      this.popSounds = [];
      if (this.scoreSound) {
        try { await this.scoreSound.unloadAsync(); } catch { /* ignore */ }
        this.scoreSound = null;
      }
      if (this.musicSound) {
        try { await this.musicSound.unloadAsync(); } catch { /* ignore */ }
        this.musicSound = null;
      }
      this.musicPlaying = false;
      this.loaded = false;
      console.log('[AudioManager] Cleaned up');
    } catch (e) {
      console.log('[AudioManager] Cleanup failed:', e);
    }
  }
}

export const audioManager = new AudioManager();
