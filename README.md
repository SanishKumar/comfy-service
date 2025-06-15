# ComfyUI-as-a-Service

## Quickstart

1. Clone this repo and `cd` into it.
2. Install [Python 3.12](https://www.python.org/downloads/) and activate a virtualenv.
3. Install dependencies: `pip install -r requirements.txt`.
4. Copy or download a Stable Diffusion model to `lib/ComfyUI/models/checkpoints/` and any LoRAs to `lib/ComfyUI/models/loras/`.
5. Run locally: `uvicorn api_server:app --reload`.
6. Test with `curl`/HTTPie against `POST /generate` as documented above.
7. Optionally build and run the Docker container (see Docker section).
