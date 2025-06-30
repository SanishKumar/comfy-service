export interface GenerateRequest {
  prompt: string;
  negative_prompt: string;
  lora_model: string;
  steps: number;
  cfg: number;
  seed: number;
}
export interface GenerateResponse {
  image: string;  // base64 string (without data: prefix)
  seed: number;
}

export async function generateImage(apiUrl: string, apiKey: string, payload: GenerateRequest): Promise<GenerateResponse> {
  const res = await fetch(`${apiUrl}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`  // if you use an API key scheme
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  return res.json();
}
