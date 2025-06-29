export default async function handler(req, res) {
  console.log("🔑 MURF_SPEECH_API_KEY:", process.env.MURF_SPEECH_API_KEY);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { text, voice_id } = req.body;

  if (!text || !voice_id) {
    return res.status(400).json({ error: "Missing required fields: text or voice_id" });
  }

  try {
    const murfResponse = await fetch("https://api.murf.ai/v1/speech/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MURF_SPEECH_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, voice_id })
    });

    const contentType = murfResponse.headers.get("content-type") || "";

    if (!murfResponse.ok) {
      const errorText = await murfResponse.text();
      return res.status(murfResponse.status).json({
        error: "Murf API returned error",
        status: murfResponse.status,
        message: errorText
      });
    }

    if (contentType.includes("application/json")) {
      const result = await murfResponse.json();
      return res.status(200).json(result);
    } else {
      const rawText = await murfResponse.text();
      return res.status(200).json({
        warning: "Murf API did not return JSON",
        content: rawText
      });
    }

  } catch (error) {
    console.error("Murf Function Error:", error);
    return res.status(500).json({
      error: "Server crashed",
      message: error.message
    });
  }
}
