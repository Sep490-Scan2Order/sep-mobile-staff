import Sound from "react-native-sound";

Sound.setCategory("Playback");

export const playAudioUrl = (url: string) => {
  return new Promise((resolve, reject) => {

    const sound = new Sound(url, "", (error) => {

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