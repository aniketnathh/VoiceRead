// netlify/functions/murf.js

export async function handler(event, context) {
  const data = JSON.parse(event.body);

  const response = await fetch("https://api.murf.ai/v1/speech/generate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.MURF_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  return {
    statusCode: response.status,
    body: JSON.stringify(result)
  };
}
