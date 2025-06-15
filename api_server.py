from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
import os
from datetime import datetime
from pathlib import Path

import comfy_generate

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: str | None = None
    seed: int | None = None
    lora_name: str | None = None
    save_image: bool = True  # Option to save image locally

app = FastAPI()

# Create output directory if it doesn't exist
OUTPUT_DIR = Path("generated_images")
OUTPUT_DIR.mkdir(exist_ok=True)

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

    img_bytes = all_bytes[0]
    
    # Save image locally if requested
    saved_path = None
    if req.save_image:
        try:
            # Create filename with timestamp and sanitized prompt
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            # Sanitize prompt for filename (remove special characters)
            safe_prompt = "".join(c for c in req.prompt[:50] if c.isalnum() or c in (' ', '-', '_')).strip()
            safe_prompt = safe_prompt.replace(' ', '_')
            
            filename = f"{timestamp}_{safe_prompt}"
            if req.seed:
                filename += f"_seed{req.seed}"
            filename += ".png"
            
            saved_path = OUTPUT_DIR / filename
            saved_path.write_bytes(img_bytes)
            
        except Exception as e:
            # Don't fail the request if saving fails, just log it
            print(f"Warning: Failed to save image: {e}")
    
    return {
        "image": base64.b64encode(img_bytes).decode("ascii"),
        "format": "png",
        "size_bytes": len(img_bytes),
        "saved_path": str(saved_path) if saved_path else None,
        "prompt": req.prompt,
        "seed": req.seed,
        "lora_name": req.lora_name
    }

@app.get("/")
async def root():
    return {
        "message": "ComfyUI-as-a-Service is running!",
        "endpoints": {
            "POST /generate": "Generate an image from a text prompt",
            "GET /images": "List saved images"
        }
    }

@app.get("/images")
async def list_images():
    """List all saved images"""
    try:
        images = []
        for img_path in OUTPUT_DIR.glob("*.png"):
            stat = img_path.stat()
            images.append({
                "filename": img_path.name,
                "size_bytes": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "path": str(img_path)
            })
        
        # Sort by creation time, newest first
        images.sort(key=lambda x: x["created"], reverse=True)
        
        return {
            "count": len(images),
            "images": images
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list images: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}