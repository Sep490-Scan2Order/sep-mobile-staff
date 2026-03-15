import Sound from "react-native-sound";
import { Platform } from "react-native";

// Enable playback in silence mode (important for iOS)
Sound.setCategory("Playback", true);
Sound.setActive(true);

let whoosh: Sound | null = null;
let isLoading = false;
let loadPromise: Promise<Sound | null> | null = null;

// Load a sound file from the app bundle
const loadSound = (): Promise<Sound | null> => {
  // Return existing promise if already loading
  if (loadPromise) {
    return loadPromise;
  }

  // Return existing sound if already loaded
  if (whoosh !== null) {
    return Promise.resolve(whoosh);
  }

  loadPromise = new Promise((resolve) => {
    isLoading = true;
    
    console.log(`[Sound] Loading sound on ${Platform.OS}...`);

    if (Platform.OS === "android") {
      // Android: Try loading from raw folder
      const androidAttempts = ["whoosh", "whoosh.mp3", "notification"];
      loadWithAttempts(androidAttempts, resolve);
    } else {
      // iOS: Try different formats
      const iOSAttempts = ["whoosh", "whoosh.m4a", "whoosh.wav"];
      loadWithAttempts(iOSAttempts, resolve);
    }

    function loadWithAttempts(attempts: string[], resolve: (sound: Sound | null) => void) {
      let attemptIndex = 0;

      const tryLoad = () => {
        if (attemptIndex >= attempts.length) {
          console.error("[Sound] ❌ All load attempts failed");
          isLoading = false;
          loadPromise = null;
          resolve(null);
          return;
        }

        const soundName = attempts[attemptIndex];
        console.log(`[Sound] Attempt ${attemptIndex + 1}/${attempts.length}: Loading "${soundName}"...`);

        try {
          whoosh = new Sound(soundName, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
              console.warn(`[Sound] ⚠️  Failed to load "${soundName}":`, error?.what, error?.extra);
              attemptIndex++;
              whoosh = null;
              tryLoad();
              return;
            }

            console.log(`[Sound] ✅ Successfully loaded "${soundName}"`);
            initializeSound(whoosh);
            isLoading = false;
            loadPromise = null;
            resolve(whoosh);
          });
        } catch (err) {
          console.error(`[Sound] 💥 Exception loading "${soundName}":`, err);
          attemptIndex++;
          whoosh = null;
          tryLoad();
        }
      };

      tryLoad();
    }
  });

  return loadPromise;
};

// Initialize sound properties
const initializeSound = (sound: Sound | null) => {
  if (!sound) return;
  
  try {
    const duration = sound.getDuration();
    const channels = sound.getNumberOfChannels();
    console.log(`[Sound] Duration: ${duration}s, Channels: ${channels}`);
    
    // Set audio properties
    sound.setVolume(1.0);
    sound.setNumberOfLoops(0);
  } catch (err) {
    console.error("[Sound] Error initializing sound:", err);
  }
};

// Play the sound when needed
export const playNotificationSound = async () => {
  try {
    const sound = await loadSound();
    
    if (!sound) {
      console.warn("[Sound] Sound object is null, cannot play");
      return;
    }

    sound.setCurrentTime(0); // Reset to beginning
    sound.play((success) => {
      if (success) {
        console.log("[Sound] Successfully finished playing notification sound");
      } else {
        console.error("[Sound] Playback failed due to audio decoding errors");
      }
    });
  } catch (err) {
    console.error("[Sound] Error playing sound:", err);
  }
};

// Export the sound object for advanced usage
export const getWhoosh = async (): Promise<Sound | null> => {
  return await loadSound();
};

// Release resources when done (call this on app cleanup)
export const releaseSound = () => {
  if (whoosh !== null) {
    try {
      whoosh.stop();
      whoosh.release();
    } catch (err) {
      console.error("[Sound] Error releasing sound:", err);
    }
    whoosh = null;
    isLoading = false;
    loadPromise = null;
  }
};

// Play audio from URL (for payment received notifications, etc.)
export const playAudioFromUrl = async (audioUrl: string) => {
  if (!audioUrl) {
    console.warn("[Sound] Audio URL is empty");
    return;
  }

  try {
    console.log("[Sound] Loading audio from URL:", audioUrl);
    
    const paymentSound = new Sound(audioUrl, undefined, (error) => {
      if (error) {
        console.error("[Sound] Failed to load audio from URL:", error?.what, error?.extra);
        return;
      }

      console.log("[Sound] Successfully loaded audio from URL, playing...");
      
      try {
        paymentSound.setVolume(1.0);
        paymentSound.setNumberOfLoops(0);
        
        paymentSound.play((success) => {
          if (success) {
            console.log("[Sound] Successfully finished playing payment notification");
          } else {
            console.error("[Sound] Payment audio playback failed");
          }
          
          try {
            paymentSound.release();
          } catch (err) {
            console.error("[Sound] Error releasing payment sound:", err);
          }
        });
      } catch (err) {
        console.error("[Sound] Error setting up audio playback:", err);
        try {
          paymentSound.release();
        } catch (releaseErr) {
          console.error("[Sound] Error releasing sound after setup error:", releaseErr);
        }
      }
    });
  } catch (err) {
    console.error("[Sound] Error playing audio from URL:", err);
  }
};