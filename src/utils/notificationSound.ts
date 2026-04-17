import Sound from "react-native-sound";
import { Platform } from "react-native";
Sound.setCategory("Playback", true);
Sound.setActive(true);
let whoosh: Sound | null = null;
let isLoading = false;
let loadPromise: Promise<Sound | null> | null = null;
const loadSound = (): Promise<Sound | null> => {
  if (loadPromise) return loadPromise;
  if (whoosh !== null) return Promise.resolve(whoosh);
  loadPromise = new Promise((resolve) => {
    isLoading = true;
    const attempts = Platform.OS === "android" 
      ? ["whoosh", "whoosh.mp3", "notification"] 
      : ["whoosh", "whoosh.m4a", "whoosh.wav"];
    const loadWithAttempts = (index: number) => {
      if (index >= attempts.length) {
        isLoading = false;
        loadPromise = null;
        resolve(null);
        return;
      }
      const sound = new Sound(attempts[index], Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          loadWithAttempts(index + 1);
          return;
        }
        whoosh = sound;
        whoosh.setVolume(1.0);
        whoosh.setNumberOfLoops(0);
        isLoading = false;
        loadPromise = null;
        resolve(whoosh);
      });
    };
    loadWithAttempts(0);
  });
  return loadPromise;
};
export const playNotificationSound = async () => {
  try {
    const sound = await loadSound();
    if (sound) {
      sound.setCurrentTime(0);
      sound.play();
    }
  } catch (err) {}
};
export const getWhoosh = () => loadSound();
export const releaseSound = () => {
  if (whoosh) {
    try {
      whoosh.stop();
      whoosh.release();
    } catch (err) {}
    whoosh = null;
    isLoading = false;
    loadPromise = null;
  }
};
export const playAudioFromUrl = (audioUrl: string) => {
  if (!audioUrl) return;
  const sound = new Sound(audioUrl, undefined, (error) => {
    if (!error) {
      try {
        sound.setVolume(1.0);
        sound.play(() => sound.release());
      } catch (err) {
        sound.release();
      }
    }
  });
};
