# backend/api_server.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from pathlib import Path
import base64

import comfy_generate  # your inference module

# 1) Create a single FastAPI app
app = FastAPI()

# 2) Configure CORS – must come before any @app.* routes
origins = [
    "http://localhost:3000",   # React Create-React-App default
    "http://127.0.0.1:3000",
    "http://localhost:5173",   # Vite default port
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # restrict to your frontend origins
    allow_credentials=True,       # if you send cookies or auth headers
    allow_methods=["*"],          # allow GET, POST, OPTIONS, etc.
    allow_headers=["*"],          # allow Content-Type, Authorization, etc.
)

# 3) Pydantic model for /generate request
class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: str | None = None
    seed: int | None = None
    lora_name: str | None = None
    save_image: bool = True

# 4) Ensure output folder exists
OUTPUT_DIR = Path("generated_images")
OUTPUT_DIR.mkdir(exist_ok=True)

# 5) /generate endpoint
@app.post("/generate")
async def generate(req: GenerateRequest):
    try:
        # your comfy_generate.generate_image should return a dict of lists of bytes
        images_dict = comfy_generate.generate_image(
            prompt=req.prompt,
            negative_prompt=req.negative_prompt or "",
            seed=req.seed,
            lora_name=req.lora_name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")

    # flatten to a single list of images
    all_bytes = [b for lst in images_dict.values() for b in lst]
    if not all_bytes:
        raise HTTPException(status_code=500, detail="No images generated")

    img_bytes = all_bytes[0]

    # optional: save locally with timestamped filename
    saved_path = None
    if req.save_image:
        try:
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe = "".join(c for c in req.prompt[:50] 
                           if c.isalnum() or c in (" ", "-", "_")).strip().replace(" ","_")
            fname = f"{ts}_{safe}"
            if req.seed is not None:
                fname += f"_seed{req.seed}"
            fname += ".png"
            saved_path = OUTPUT_DIR / fname
            saved_path.write_bytes(img_bytes)
        except Exception as warn:
            print(f"Warning: failed to save image locally: {warn}")

    # return base64 image + metadata
    return {
        "image": base64.b64encode(img_bytes).decode("ascii"),
        "format": "png",
        "size_bytes": len(img_bytes),
        "saved_path": str(saved_path) if saved_path else None,
        "prompt": req.prompt,
        "seed": req.seed,
        "lora_name": req.lora_name,
    }

# 6) Root endpoint
@app.get("/")
async def root():
    return {
        "message": "ComfyUI-as-a-Service is running!",
        "endpoints": {
            "POST /generate": "Generate an image from a text prompt",
            "GET  /images": "List saved images",
            "GET  /health": "Health check",
        },
    }

# 7) List saved images
@app.get("/images")
async def list_images():
    try:
        files = []
        for img in OUTPUT_DIR.glob("*.png"):
            stat = img.stat()
            files.append({
                "filename": img.name,
                "size_bytes": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "path": str(img),
            })
        files.sort(key=lambda x: x["created"], reverse=True)
        return {"count": len(files), "images": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing images: {e}")

# 8) Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
