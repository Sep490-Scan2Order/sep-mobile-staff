import RNFS from "react-native-fs";
import { Buffer } from "buffer";
import Config from "react-native-config";

export const generateOrderVoice = async (orderCode: number) => {
  try {

    const text = `Quý khách tới nhận đơn số - ${orderCode}`;

    const filePath = `${RNFS.DocumentDirectoryPath}/order_${orderCode}.mp3`;

    // Xóa cache cũ
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
console.log("OPENAI KEY:", Config.OPENAI_API_KEY);
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Config.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "audio/mpeg", // QUAN TRỌNG
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice: "cedar",
        input: text,
      }),
    });

    console.log("TTS status:", response);

    // Nếu API lỗi
    if (!response.ok) {
      const errorText = await response.text();
      console.log("TTS API error:", errorText);
      throw new Error("TTS request failed");
    }

    // Lấy audio binary
    const arrayBuffer = await response.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("Empty audio response");
    }

    const base64data = Buffer.from(arrayBuffer).toString("base64");

    await RNFS.writeFile(filePath, base64data, "base64");

    const stat = await RNFS.stat(filePath);

    console.log("Voice saved:", filePath);
    console.log("Voice size:", stat.size);

    if (stat.size < 1000) {
      throw new Error("Audio file too small, probably API error");
    }

    return filePath;

  } catch (error) {
    console.log("generateOrderVoice error:", error);
    throw error;
  }
};