export async function handler(event) {
  try {
    const { text, voice_id } = JSON.parse(event.body);

    const murfResponse = await fetch("https://api.murf.ai/v1/speech/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MURF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, voice_id })
    });

    const contentType = murfResponse.headers.get("content-type") || "";

    if (!murfResponse.ok) {
      const errorText = await murfResponse.text();
      return {
        statusCode: murfResponse.status,
        body: JSON.stringify({
          error: "Murf API returned error",
          status: murfResponse.status,
          message: errorText
        }),
      };
    }

    if (contentType.includes("application/json")) {
      const result = await murfResponse.json();
      return {
        statusCode: murfResponse.status,
        body: JSON.stringify(result)
      };
    } else {
      const rawText = await murfResponse.text();
      return {
        statusCode: murfResponse.status,
        body: JSON.stringify({
          error: "Non-JSON response from Murf",
          data: rawText
        })
      };
    }

  } catch (err) {
    console.error("Murf function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server function crashed",
        details: err.message
      })
    };
  }
}
