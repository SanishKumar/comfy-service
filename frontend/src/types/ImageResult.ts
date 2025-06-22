export interface ImageResult {
  /** Unique ID for this generation (e.g. timestamp or UUID) */
  id: string;

  /** The prompt you used */
  prompt: string;

  /** Optional negative prompt */
  negativePrompt: string;

  /** LoRA adapter name */
  loraModel: string;

  /** Number of sampling steps */
  steps: number;

  /** CFG / guidance scale */
  cfg: number;

  /** Random seed used */
  seed: number;

  /** The raw base64 PNG data (without the `data:image/...` prefix) */
  imageData: string;
}
