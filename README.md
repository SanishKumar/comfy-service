# ComfyUI-as-a-Service

A minimal, modular proof-of-concept API for LoRA-enabled image generation using ComfyUI.  
This project provides the foundational inference and backend layer of my larger LoRA fine-tuning and serving pipeline.

---

## Table of Contents

1. [Features](#features)  
2. [Prerequisites](#prerequisites)  
3. [Installation](#installation)  
4. [Usage](#usage)  
   - [Start the Server](#start-the-server)  
   - [Example Request](#example-request)  
5. [API Reference](#api-reference)  
6. [Testing](#testing)  
7. [Next Steps](#next-steps)  

---

## Features

- 🔄 **ComfyUI Workflow**  
  - Loads a Stable Diffusion checkpoint  
  - Applies a chosen LoRA adapter  
  - Outputs raw PNG bytes  

- 🐍 **Inference Module** (`comfy_generate.py`)  
  - Function signature:  
    ```python
    generate_image(prompt: str, lora_path: Optional[str], seed: Optional[int]) -> bytes
    ```  
  - Accepts text prompt, optional LoRA path, and seed  
  - Runs on CPU (or GPU if available)  
  - Returns PNG image data  

- 🚀 **REST API** (`api_server.py`)  
  - FastAPI application exposing `POST /generate`  
  - Validates JSON input  
  - Returns Base64-encoded PNG + metadata  

- 📄 **Documentation & Testing**  
  - Step-by-step instructions in this README  
  - Basic `pytest` suite for request validation  

---

## Prerequisites

- **Python 3.8+**  
- **pip** (package installer)  
- *(Optional)* GPU with CUDA support  
- Internet connection to install dependencies and download base models  

---

## Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/yourusername/comfyui-as-a-service.git
   cd comfyui-as-a-service
   ```

2. **Create & activate a virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # Linux / macOS
   venv\Scripts\activate      # Windows
   ```

3. **Install Python dependencies**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Place your ComfyUI .flow file and LoRA adapters**
   - Put `workflow.flow` (or your own .flow) in the project root
   - Create a `models/` folder and add any `.safetensors` or adapter files

---

## Usage

### Start the Server

```bash
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

By default runs on CPU.

To use GPU (if installed), ensure your environment has CUDA-enabled PyTorch, then the same command will pick up your GPU automatically.

### Example Request

Send a POST to `/generate` with JSON:

```bash
curl -X POST http://localhost:8000/generate \
     -H "Content-Type: application/json" \
     -d '{
           "prompt": "A futuristic cityscape at sunset",
           "lora_path": "models/my_adapter.safetensors",
           "seed": 42
         }'
```

Response:

```json
{
  "image": "<base64-encoded PNG>",
  "seed": 42
}
```

---

## API Reference

### POST /generate

**Request JSON fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt | str | Yes | Text prompt for image generation. |
| lora_path | str | No | Path to a LoRA adapter file (relative path). |
| seed | int | No | Random seed for reproducibility. |

**Response JSON fields**

| Field | Type | Description |
|-------|------|-------------|
| image | str | Base64-encoded PNG image data. |
| seed | int | The seed used for generation. |

---

## Testing

1. **Install test requirements**
   ```bash
   pip install pytest
   ```

2. **Run tests**
   ```bash
   pytest
   ```

Tests cover:
- Valid `/generate` requests returning 200 + image.
- Invalid payloads returning 4xx errors.

---

## Next Steps

- Integrate this API into your larger LoRA fine-tuning pipeline.
- Add support for multiple workflows and batch inference.
- Build a simple web frontend to visualize results.
- Implement authentication and rate limiting.
