# ComfyUI-as-a-Service

A proof‑of‑concept API and web client for LoRA‑enabled image generation using ComfyUI.
This repo now includes:

* **Backend**: FastAPI service wrapping ComfyUI workflows (.flow) for single‑image generation, with CORS enabled for local frontend integration.
* **Frontend**: Vite + React + TypeScript + SWC app featuring prompt input, LoRA/model selection, parameter sliders, generation button with loader, result gallery, history & favorites persisted in localStorage, and settings panel.

---

## Table of Contents

1. [Features](#features)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Usage](#usage)

   * [Start Backend](#start-backend)
   * [Start Frontend](#start-frontend)
   * [Running Together](#running-together)
5. [API Reference](#api-reference)
6. [Frontend Reference](#frontend-reference)
7. [Testing](#testing)
8. [Next Steps](#next-steps)

## Features

* 🔄 **ComfyUI Workflow**

  * Loads a Stable Diffusion checkpoint + optional LoRA adapter
  * Runs in‑process without requiring a separate ComfyUI HTTP server
  * Single‑image output as PNG bytes

* 🚀 **REST API** (`backend/api_server.py`)

  * `POST /generate` accepts prompt, negative\_prompt, LoRA name, seed
  * Returns Base64‑encoded PNG, metadata (size, seed, saved\_path)
  * CORS enabled for `http://localhost:3000` and `http://localhost:5173`

* 💻 **Frontend** (`frontend/`)

  * Prompt form: text, negative prompt, LoRA selector, sliders for steps & CFG, seed input
  * Generate button with loading spinner
  * Result gallery: display image, Download / Regenerate / Save Favorite buttons
  * **History** & **Favorites** stored in browser `localStorage`
  * **Settings** panel: API URL, API key, default parameters (persisted)


---

## Prerequisites

* **Python** 3.8+ (backend)
* **Node.js** 18+ & **npm** (frontend)
* *(Optional)* GPU with CUDA for faster inference
* Git, pip, and basic CLI tools

---

## Installation

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/comfyui-as-a-service.git
cd comfyui-as-a-service
```

### 2. Setup Backend

```bash
cd backend
python3 -m venv .venv
# Windows: .\.venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Put your `.flow` file at `backend/flows/text2img_lora.flow` and any LoRA adapters under `backend/models/loras/` if needed.

### 3. Setup Frontend

```bash
cd frontend
# If you haven’t yet scaffolded:
# npm create vite@latest . -- --template react-ts-swc
npm install
```

Add or adjust `.env` in `frontend/` as needed:

```ini
VITE_API_URL=http://localhost:8000
VITE_DEFAULT_STEPS=20
VITE_DEFAULT_CFG=7.5
```
---

## Usage

### Start Backend

```bash
cd backend
# ensure virtualenv is active
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend

```bash
cd frontend
npm run dev
```

* Frontend runs on `http://localhost:5173` by default.
* Ensure `.env` `VITE_API_URL` matches your backend URL.

### Running Together

1. Start backend on port 8000.
2. Start frontend on port 5173.
3. In your browser, navigate to `http://localhost:5173`.
4. Enter prompts, adjust settings, and generate images.

---

## API Reference

### POST /generate

* **URL**: `/generate`
* **Method**: `POST`
* **Request JSON**:

  ```json
  {
    "prompt": "A serene lake at sunrise",
    "negative_prompt": "blurry",
    "lora_name": "coolstyle.safetensors",
    "seed": 12345,
    "save_image": true
  }
  ```
* **Response JSON**:

  ```json
  {
    "image": "<base64 PNG>",
    "format": "png",
    "size_bytes": 34567,
    "saved_path": "generated_images/20250622_prompt_seed12345.png",
    "prompt": "A serene lake at sunrise",
    "seed": 12345,
    "lora_name": "coolstyle.safetensors"
  }
  ```

### GET /images

* Returns a list of saved images in `backend/generated_images/`.

### GET /health

* Health check: `{ "status": "healthy", "timestamp": "…" }`

---

## Frontend Reference

* **PromptForm**: collects prompt, negative prompt, LoRA model, steps, CFG, seed.
* **GenerateButton**: triggers API call and shows loading spinner.
* **ResultGallery**: displays generated image and actions (Download, Regenerate, Save Favorite).
* **HistoryList** & **FavoritesList**: show past results and saved favorites; data persisted in `localStorage`.
* **SettingsPanel**: edit and persist `VITE_API_URL`, API key (if used), default steps/CFG.

All components live under `frontend/src/components/` and share state via React Hooks (see `useImageGenerator` hook in `frontend/src/hooks/useImageGenerator.ts`).

---

## Docker (Local Testing)

A `docker-compose.yml` is provided for spinning up both services locally:

```yaml
version: "3.8"
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: "http://backend:8000"
    depends_on:
      - backend
```

Run:

```bash
docker-compose up --build
```

* Backend at `http://localhost:8000`
* Frontend at `http://localhost:3000`

---

## Testing

### Backend Tests

```bash
cd backend
pip install pytest
pytest
```

### Frontend Tests

(Add your React testing framework, e.g. Vitest or Jest)

```bash
cd frontend
npm run test
```

---

## Next Steps

* 🔒 Add authentication (API keys, JWT) to `/generate`.
* 🔄 Support multiple `.flow` workflows and batch generation.
* 🏗️ Integrate more ComfyUI nodes (inpainting, ControlNet).
* ☁️ Deploy backend to a GPU‑enabled VM or container service.
* 📈 Monitor performance and scale with GPU clusters.
