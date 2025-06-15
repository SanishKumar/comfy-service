from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64

import comfy_generate

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: str | None = None
    seed: int | None = None
    lora_name: str | None = None

app = FastAPI()

@app.post("/generate")
async def generate(req: GenerateRequest):
    try:
        images = comfy_generate.generate_image(
            prompt=req.prompt,
            negative_prompt=req.negative_prompt or "",
            seed=req.seed,
            lora_name=req.lora_name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Flatten all node images into one list
    all_bytes = []
    for lst in images.values():
        all_bytes.extend(lst)

    if not all_bytes:
        raise HTTPException(status_code=500, detail="No images generated")

    img0 = all_bytes[0]
    return {
        "image": base64.b64encode(img0).decode("ascii"),
        "format": "png",
        "size_bytes": len(img0),
    }
