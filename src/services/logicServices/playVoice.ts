import Sound from "react-native-sound";

Sound.setCategory("Playback");

export const playVoiceFile = (path: string) => {
  return new Promise((resolve, reject) => {

    const sound = new Sound(path, "", (error) => {

      if (error) {
        reject(error);
        return;
      }

      sound.play((success) => {

        sound.release();

        if (success) resolve(true);
        else reject("Playback failed");

      });

    });

  });
};