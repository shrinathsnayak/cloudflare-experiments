import { ALLOWED_AUDIO_TYPES, MAX_AUDIO_BYTES } from "../constants/defaults";

export async function validateAudioFile(
  file: File | null
): Promise<{ buffer: ArrayBuffer; type: string } | null> {
  if (!file || !(file instanceof File)) return null;
  if (file.size === 0 || file.size > MAX_AUDIO_BYTES) return null;

  const type = (file.type || "audio/mpeg").toLowerCase();
  const isAudio =
    type.startsWith("audio/") ||
    ALLOWED_AUDIO_TYPES.includes(type as (typeof ALLOWED_AUDIO_TYPES)[number]);
  if (!isAudio) return null;

  const buffer = await file.arrayBuffer();
  return { buffer, type: file.type || "audio/mpeg" };
}

export function toBase64Audio(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
