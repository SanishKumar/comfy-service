import uuid
import json
import random
import requests
import websocket
from urllib.parse import urlencode

SERVER = "127.0.0.1:8188"

def get_basic_workflow():
    """
    Returns a basic ComfyUI workflow for text-to-image generation.
    This is a minimal workflow that loads a checkpoint and generates an image.
    """
    return {
        "1": {
            "inputs": {
                "ckpt_name": "dreamshaper_8.safetensors"  # Loading models 
            },
            "class_type": "CheckpointLoaderSimple",
            "_meta": {
                "title": "Load Checkpoint"
            }
        },
        "2": {
            "inputs": {
                "text": "beautiful scenery"  # Positive Prompt
            },
            "class_type": "CLIPTextEncode",
            "_meta": {
                "title": "CLIP Text Encode (Prompt)"
            }
        },
        "3": {
            "inputs": {
                "text": ""  # Negative Prompt
            },
            "class_type": "CLIPTextEncode",
            "_meta": {
                "title": "CLIP Text Encode (Negative)"
            }
        },
        "4": {
            "inputs": {
                "seed": 42,  # This will be replaced with actual seed
                "steps": 20,
                "cfg": 7.0,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1.0,
                "model": ["1", 0],
                "positive": ["2", 0],
                "negative": ["3", 0],
                "latent_image": ["5", 0]
            },
            "class_type": "KSampler",
            "_meta": {
                "title": "KSampler"
            }
        },
        "5": {
            "inputs": {
                "width": 512,
                "height": 512,
                "batch_size": 1
            },
            "class_type": "EmptyLatentImage",
            "_meta": {
                "title": "Empty Latent Image"
            }
        },
        "6": {
            "inputs": {
                "samples": ["4", 0],
                "vae": ["1", 2]
            },
            "class_type": "VAEDecode",
            "_meta": {
                "title": "VAE Decode"
            }
        },
        "7": {
            "inputs": {
                "filename_prefix": "ComfyUI",
                "images": ["6", 0]
            },
            "class_type": "SaveImage",
            "_meta": {
                "title": "Save Image"
            }
        }
    }

def get_lora_workflow():
    """
    Returns a ComfyUI workflow with LoRA support.
    """
    return {
        "1": {
            "inputs": {
                "ckpt_name": "dreamshaper_8.safetensors"  # Using available model
            },
            "class_type": "CheckpointLoaderSimple",
            "_meta": {
                "title": "Load Checkpoint"
            }
        },
        "2": {
            "inputs": {
                "lora_name": "example_lora.safetensors",  # Will be replaced by actual LoRA name
                "strength_model": 1.0,
                "strength_clip": 1.0,
                "model": ["1", 0],
                "clip": ["1", 1]
            },
            "class_type": "LoraLoader",
            "_meta": {
                "title": "Load LoRA"
            }
        },
        "3": {
            "inputs": {
                "text": "beautiful scenery"
            },
            "class_type": "CLIPTextEncode",
            "_meta": {
                "title": "CLIP Text Encode (Prompt)"
            }
        },
        "4": {
            "inputs": {
                "text": ""
            },
            "class_type": "CLIPTextEncode",
            "_meta": {
                "title": "CLIP Text Encode (Negative)"
            }
        },
        "5": {
            "inputs": {
                "seed": 42,
                "steps": 20,
                "cfg": 7.0,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1.0,
                "model": ["2", 0],
                "positive": ["3", 0],
                "negative": ["4", 0],
                "latent_image": ["6", 0]
            },
            "class_type": "KSampler",
            "_meta": {
                "title": "KSampler"
            }
        },
        "6": {
            "inputs": {
                "width": 512,
                "height": 512,
                "batch_size": 1
            },
            "class_type": "EmptyLatentImage",
            "_meta": {
                "title": "Empty Latent Image"
            }
        },
        "7": {
            "inputs": {
                "samples": ["5", 0],
                "vae": ["1", 2]
            },
            "class_type": "VAEDecode",
            "_meta": {
                "title": "VAE Decode"
            }
        },
        "8": {
            "inputs": {
                "filename_prefix": "ComfyUI",
                "images": ["7", 0]
            },
            "class_type": "SaveImage",
            "_meta": {
                "title": "Save Image"
            }
        }
    }

def queue_prompt(workflow: dict):
    """Queue a workflow to ComfyUI."""
    cid = str(uuid.uuid4())
    payload = {
        "prompt": workflow,
        "client_id": cid
    }
    
    resp = requests.post(f"http://{SERVER}/prompt", json=payload)
    resp.raise_for_status()
    data = resp.json()
    return data["prompt_id"], cid

def wait_for_done(ws, pid):
    """Wait for workflow execution to complete."""
    while True:
        msg = ws.recv()
        if not isinstance(msg, str):
            continue
        m = json.loads(msg)
        if m.get("type") == "executing" \
           and m["data"].get("node") is None \
           and m["data"].get("prompt_id") == pid:
            return

def fetch_images(pid: str):
    """Fetch generated images from ComfyUI."""
    hist = requests.get(f"http://{SERVER}/history/{pid}").json()[str(pid)]
    out = {}
    for nid, node in hist["outputs"].items():
        if "images" not in node:
            continue
        imgs = []
        for im in node["images"]:
            q = urlencode({
                "filename": im["filename"],
                "subfolder": im["subfolder"],
                "type": im["type"]
            })
            raw = requests.get(f"http://{SERVER}/view?{q}").content
            imgs.append(raw)
        out[nid] = imgs
    return out

def generate_image(
    prompt: str,
    negative_prompt: str = "",
    seed: int = None,
    lora_name: str = None
) -> dict:
    """
    Generate an image using ComfyUI.
    Returns a dict mapping node_id -> list of PNG bytes.
    """
    # Choose workflow based on whether LoRA is specified
    if lora_name:
        workflow = get_lora_workflow()
        # Update LoRA name
        workflow["2"]["inputs"]["lora_name"] = lora_name
        # Update CLIP inputs to use LoRA outputs
        workflow["3"]["inputs"]["clip"] = ["2", 1]
        workflow["4"]["inputs"]["clip"] = ["2", 1]
        # Update prompt and negative prompt
        workflow["3"]["inputs"]["text"] = prompt
        workflow["4"]["inputs"]["text"] = negative_prompt
        # Update seed
        if seed is not None:
            workflow["5"]["inputs"]["seed"] = seed
        else:
            workflow["5"]["inputs"]["seed"] = random.randint(0, 2**32-1)
    else:
        workflow = get_basic_workflow()
        # Update CLIP inputs
        workflow["2"]["inputs"]["clip"] = ["1", 1]
        workflow["3"]["inputs"]["clip"] = ["1", 1]
        # Update prompt and negative prompt
        workflow["2"]["inputs"]["text"] = prompt
        workflow["3"]["inputs"]["text"] = negative_prompt
        # Update seed
        if seed is not None:
            workflow["4"]["inputs"]["seed"] = seed
        else:
            workflow["4"]["inputs"]["seed"] = random.randint(0, 2**32-1)
    
    # Queue the workflow
    pid, cid = queue_prompt(workflow)
    
    # Wait for completion
    ws = websocket.WebSocket()
    ws.connect(f"ws://{SERVER}/ws?clientId={cid}")
    wait_for_done(ws, pid)
    ws.close()
    
    # Fetch results
    return fetch_images(pid)