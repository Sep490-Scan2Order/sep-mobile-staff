import { orderService } from "../../services/logicServices/orderService";

export const getOrderAudio = async (orderCode: number) => {

  const staticUrl = `http://103.179.185.199/audio/order_${orderCode}.mp3`;

  console.log("---- AUDIO CHECK START ----");
  console.log("OrderCode:", orderCode);
  console.log("Checking URL:", staticUrl);

  try {

    const check = await fetch(staticUrl, { method: "HEAD" });

    console.log("HEAD status:", check.status);

    if (check.status === 200) {

      console.log("Audio exists → use static");

      return staticUrl;

    }

    if (check.status === 404) {

      console.log("Audio NOT FOUND → call API");

    }

  } catch (err) {

    console.log("HEAD error → fallback API", err);

  }

  // 🔊 CALL API USING AXIOS SERVICE
  const response = await orderService.readyForPickup(orderCode);

  console.log("API generate response:", response);

  if (response.success && response.audioUrl) {

    return response.audioUrl;

  }

  throw new Error("Cannot get order audio");

};