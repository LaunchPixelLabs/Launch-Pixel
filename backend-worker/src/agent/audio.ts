import { Bindings } from '../index';

/**
 * Transcribes audio buffer into text using the supercharged NVIDIA proxy (Whisper).
 */
export async function transcribeAudio(audioBuffer: Buffer, env: Bindings): Promise<string> {
  const proxyUrl = 'http://127.0.0.1:1338/v1/audio/transcriptions';
  
  try {
    // NVIDIA NIM expects multipart/form-data for transcription
    const formData = new FormData();
    const file = new Blob([audioBuffer], { type: 'audio/ogg' }); // WhatsApp uses OGG/Opus
    formData.append('file', file, 'audio.ogg');
    formData.append('model', 'nvidia/whisper-v3');
    formData.append('response_format', 'json');

    const res = await fetch(proxyUrl, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Transcription failed: ${err}`);
    }

    const data = await res.json() as any;
    return data.text;
  } catch (error) {
    console.error("[Audio] Transcription failed:", error);
    throw error;
  }
}
