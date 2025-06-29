const fileInput = document.getElementById('pdf-upload');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const languageSelect = document.getElementById('language');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speed-value');
const moodSelect = document.getElementById('mood');
const narrationSelect = document.getElementById('narration');
const transcriptBox = document.getElementById('transcript-text');
const audioPlayer = document.getElementById('audioPlayer');
const dubLanguageSelect = document.getElementById('dub-language');

let extractedText = '';

// ====== PDF Upload & Text Extraction ======
fileInput.addEventListener('change', function () {
  const file = fileInput.files[0];
  if (!file || file.type !== 'application/pdf') {
    alert('Please upload a valid PDF file.');
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = function () {
    const typedarray = new Uint8Array(this.result);
    pdfjsLib.getDocument(typedarray).promise.then(pdf => {
      let allText = '';
      const readPages = (pageNum) => {
        pdf.getPage(pageNum).then(page => {
          page.getTextContent().then(textContent => {
            const pageText = textContent.items.map(item => item.str).join(' ');
            allText += pageText + ' ';
            if (pageNum < pdf.numPages) {
              readPages(pageNum + 1);
            } else {
              extractedText = allText.trim();
              alert(" PDF loaded successfully!");
              console.log("Extracted Text:", extractedText);
            }
          });
        });
      };
      readPages(1);
    });
  };
  fileReader.readAsArrayBuffer(file);
});

// ====== Mood & Narration Transform ======
function transformText(text, mood, narration) {
  let transformed = text;

  if (narration === 'short') {
    transformed = text.split('. ').slice(0, 3).join('. ') + '.';
  } else if (narration === 'bullet') {
    transformed = text.split('. ').map(line => '• ' + line.trim()).join('\n');
  } else if (narration === 'descriptive') {
    transformed = 'Let me explain this in detail.\n\n' + text;
  }

  if (mood === 'calm') {
    transformed = 'In a calm tone:\n' + transformed;
  } else if (mood === 'jolly') {
    transformed = 'Let\'s enjoy this together! \n' + transformed;
  } else if (mood === 'serious') {
    transformed = 'Please listen carefully:\n' + transformed;
  }

  return transformed;
}

// ====== Send Text to Murf API via Proxy and Play ======
async function speakWithMurf(text, voiceId) {
  const apiUrl = 'http://localhost:3000/murf';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, voice_id: voiceId })
    });

    const data = await response.json();
    const audioUrl = data.audio_url || data.audioFile;

    if (audioUrl) {
      return audioUrl;
    } else {
      console.error(" No audio URL in response", data);
      return null;
    }
  } catch (err) {
    console.error(" Murf API error:", err);
    return null;
  }
}

// ====== Play Button Handler ======
playBtn.addEventListener('click', async () => {
  if (!extractedText) {
    alert("Upload a PDF first!");
    return;
  }

  const mood = moodSelect.value;
  const narration = narrationSelect.value;
  const processedText = transformText(extractedText, mood, narration);

  const selectedVoiceId = dubLanguageSelect.value;

  const audioUrl = await speakWithMurf(processedText, selectedVoiceId);
  if (audioUrl) {
    audioPlayer.src = audioUrl;
    audioPlayer.play();
    
  }
});

// ====== Speed Control ======
speedControl.addEventListener('input', () => {
  speedValue.textContent = speedControl.value + 'x';
  audioPlayer.playbackRate = parseFloat(speedControl.value);
});

// ====== Pause & Stop Buttons ======
pauseBtn.addEventListener('click', () => {
  if (!audioPlayer.paused) {
    audioPlayer.pause();
  }
});

stopBtn.addEventListener('click', () => {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
});
// ====== Feature Scroll Animation ======
document.addEventListener("DOMContentLoaded", () => {
  const featureItems = document.querySelectorAll(".feature-item");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  }, { threshold: 0.2 });

  featureItems.forEach(item => observer.observe(item));
});
const speedSlider = document.getElementById('speedControl');
const speedValuee = document.getElementById('speed-value');
const increaseBtn = document.getElementById('increase-speed');
const decreaseBtn = document.getElementById('decrease-speed');

function updateSpeedDisplay() {
  speedValuee.textContent = `${speedSlider.value}x`;
}

increaseBtn.addEventListener('click', () => {
  let current = parseFloat(speedSlider.value);
  if (current < 2) {
    current += 0.1;
    speedSlider.value = current.toFixed(1);
    updateSpeedDisplay();
  }
});

decreaseBtn.addEventListener('click', () => {
  let current = parseFloat(speedSlider.value);
  if (current > 0.5) {
    current -= 0.1;
    speedSlider.value = current.toFixed(1);
    updateSpeedDisplay();
  }
});

speedSlider.addEventListener('input', updateSpeedDisplay);
