const parseDemoUrlsFromEnv = () => {
  const raw = import.meta.env.VITE_DEMO_AUDIO_URLS;
  if (!raw || typeof raw !== 'string') {
    return [];
  }

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

// Professional setup:
// 1) Use first-party URLs from VITE_DEMO_AUDIO_URLS when configured.
// 2) Fall back to generated in-app audio to avoid CORS/network dependency.
export const DEMO_AUDIO_URLS = parseDemoUrlsFromEnv();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const hashSeed = (seed = '') => {
  if (!seed) return 0;

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const createToneWavDataUrl = (seed = '') => {
  const hash = hashSeed(seed);
  const sampleRate = 22050;
  const durationSec = 3;
  const sampleCount = sampleRate * durationSec;
  const frequency = 180 + (hash % 420);
  const attackSamples = Math.floor(sampleRate * 0.03);
  const releaseSamples = Math.floor(sampleRate * 0.15);
  const dataSize = sampleCount * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, text) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    const wave = Math.sin(2 * Math.PI * frequency * t);
    const harmonic = Math.sin(2 * Math.PI * frequency * 2 * t) * 0.25;

    let envelope = 1;
    if (i < attackSamples) {
      envelope = i / attackSamples;
    } else if (i > sampleCount - releaseSamples) {
      envelope = (sampleCount - i) / releaseSamples;
    }

    const sample = clamp((wave + harmonic) * envelope * 0.45, -1, 1);
    view.setInt16(offset, sample * 32767, true);
    offset += 2;
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return `data:audio/wav;base64,${btoa(binary)}`;
};

export const getDemoAudioUrl = (seed = '') => {
  if (DEMO_AUDIO_URLS.length) {
    if (!seed) {
      return DEMO_AUDIO_URLS[0];
    }

    const hash = hashSeed(seed);
    return DEMO_AUDIO_URLS[hash % DEMO_AUDIO_URLS.length];
  }

  return createToneWavDataUrl(seed || 'harmonix');
};
