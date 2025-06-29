require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({limit:'50mb'}));


// Root route
app.get('/', (req, res) => {
  res.send('🎙️ Murf Proxy Server is running!');
});

async function callMurfAPI(text, voice_id, apiKey) {
  const payload = {
    text,
    voice_id,
    format: 'mp3'
  };

  try {
    const response = await fetch('https://api.murf.ai/v1/speech/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    const raw = await response.text();
    try {
      const data = JSON.parse(raw);
      const audioUrl = data.audio_url || data.audioFile;
      if (audioUrl) {
        return { audio_url: audioUrl };
      } else {
        console.error(' Murf API did not return an audio URL:', data);
        return { error: 'Murf API did not return an audio URL', details: data };
      }
    } catch (err) {
      console.error(' Murf API did not return JSON:', raw);
      return { error: 'Murf API did not return JSON', raw };
    }
  } catch (err) {
    console.error(' Error while calling Murf API:', err.message);
    return { error: 'Fetch failed', message: err.message };
  }
}

// Route for ------------->normal speech
app.post('/murf', async (req, res) => {
  const { text, voice_id } = req.body;
  if (!text || !voice_id) {
    return res.status(400).json({ error: 'Missing required fields: text and voice_id' });
  }

  const result = await callMurfAPI(text, voice_id, process.env.MURF_SPEECH_API_KEY);
  if (result.audio_url) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

//Route for  --------->dubbing
app.post('/dub', async (req, res) => {
  const { text, voice_id } = req.body;
  if (!text || !voice_id) {
    return res.status(400).json({ error: 'Missing required fields: text and voice_id' });
  }

  const result = await callMurfAPI(text, voice_id, process.env.MURF_DUB_API_KEY);
  if (result.audio_url) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

//start-----> server
app.listen(PORT, () => {
  console.log(` Murf proxy server running at http://localhost:${PORT}`);
});
